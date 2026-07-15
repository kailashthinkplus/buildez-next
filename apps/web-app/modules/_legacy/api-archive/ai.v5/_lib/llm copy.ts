import OpenAI from "openai";
import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/* ---------------------------------------------------------------------------
   ENV VALIDATION
--------------------------------------------------------------------------- */
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

/* ---------------------------------------------------------------------------
   OPENAI CLIENT
--------------------------------------------------------------------------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------------------------------------------------------------------
   TYPES
--------------------------------------------------------------------------- */

type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
};

type InterviewResult = {
  mode: "questions";
  phase: "INTERVIEW";
  questions: {
    id: string;
    question: string;
    type: "text" | "select";
    options?: string[];
  }[];
};

type V5Result =
  | InterviewResult
  | {
      blueprint: BlueprintNode;
      pages?: string[];
      designTokens?: any;
      usage: TokenUsage;
    };

/* ---------------------------------------------------------------------------
   SYSTEM PROMPTS
--------------------------------------------------------------------------- */

const SYSTEM_INTERVIEW = `
You are BuildEZ AI.

Your job:
- Decide if enough information exists to generate a website.

If NOT enough info:
Return JSON ONLY:
{
  "mode": "questions",
  "phase": "INTERVIEW",
  "questions": [
    {
      "id": "business_type",
      "question": "What type of business is this website for?",
      "type": "text"
    },
    {
      "id": "primary_goal",
      "question": "What is the primary goal of this website?",
      "type": "select",
      "options": ["Leads", "Sales", "Branding", "Information"]
    },
    {
      "id": "tone",
      "question": "What tone should the website have?",
      "type": "select",
      "options": ["Professional", "Friendly", "Premium", "Bold"]
    }
  ]
}

If ENOUGH info exists:
Return JSON ONLY:
{
  "mode": "continue"
}
`;

const SYSTEM_PLAN = `
You are BuildEZ AI.

Task:
- Decide required pages for a marketing website.

Return JSON ONLY:
{
  "pages": ["Home", "About", "Services", "Contact"]
}
`;

const SYSTEM_LAYOUT = `
You are BuildEZ AI — layout engine.

Rules:
- Output ONLY valid JSON
- Root node MUST be type "page"
- Allowed node types only
- NO colors
- NO fonts
- Structure only
`;

const SYSTEM_STYLE = `
You are BuildEZ AI — design system generator.

Return JSON ONLY:
{
  "designTokens": {
    "colors": {},
    "typography": {},
    "spacing": {}
  }
}
`;

const SYSTEM_REFINE = `
You are BuildEZ AI — content refiner.

Rules:
- Improve copy only
- DO NOT change structure
- DO NOT remove nodes
- Root must remain type "page"
- Return FULL blueprint JSON
`;

/* ---------------------------------------------------------------------------
   SAFE JSON EXTRACTION
--------------------------------------------------------------------------- */
function extractJSON(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI returned non-JSON output");
  }
  return JSON.parse(match[0]);
}

/* ---------------------------------------------------------------------------
   LOW-LEVEL LLM CALL
--------------------------------------------------------------------------- */
async function callLLM(
  system: string,
  user: string
): Promise<{ data: any; usage: TokenUsage }> {
  const res = await openai.chat.completions.create({
    model: "gpt-5.1",
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = res.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty LLM response");

  return {
    data: extractJSON(raw),
    usage: {
      promptTokens: res.usage?.prompt_tokens ?? 0,
      completionTokens: res.usage?.completion_tokens ?? 0,
    },
  };
}

/* ---------------------------------------------------------------------------
   V5 GENERATE BLUEPRINT (AUTHORITATIVE)
--------------------------------------------------------------------------- */
export async function generateBlueprint(
  prompt: string,
  opts: {
    page: BlueprintNode;
    context?: any;
    executionContext?: any;
    existingDesignTokens?: any;
  }
): Promise<V5Result> {
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  /* ----------------------------------------------------------
     0️⃣ INTERVIEW CHECK (BLOCKER)
  ---------------------------------------------------------- */
  const interview = await callLLM(
    SYSTEM_INTERVIEW,
    JSON.stringify({
      prompt,
      context: opts.context,
    })
  );

  totalPromptTokens += interview.usage.promptTokens;
  totalCompletionTokens += interview.usage.completionTokens;

  if (interview.data?.mode === "questions") {
    return interview.data as InterviewResult;
  }

  /* ----------------------------------------------------------
     1️⃣ PLAN
  ---------------------------------------------------------- */
  const plan = await callLLM(SYSTEM_PLAN, prompt);
  totalPromptTokens += plan.usage.promptTokens;
  totalCompletionTokens += plan.usage.completionTokens;

  const pages: string[] = plan.data?.pages ?? [];

  /* ----------------------------------------------------------
     2️⃣ LAYOUT
  ---------------------------------------------------------- */
  const layout = await callLLM(
    SYSTEM_LAYOUT,
    JSON.stringify({
      prompt,
      page: opts.page,
      context: opts.context,
    })
  );

  totalPromptTokens += layout.usage.promptTokens;
  totalCompletionTokens += layout.usage.completionTokens;

  let blueprint: BlueprintNode = layout.data;

  if (!blueprint || blueprint.type !== "page") {
    throw new Error("Layout stage did not return a valid page blueprint");
  }

  /* ----------------------------------------------------------
     3️⃣ STYLE
  ---------------------------------------------------------- */
  const style = await callLLM(
    SYSTEM_STYLE,
    JSON.stringify({
      prompt,
      pages,
      context: opts.context,
    })
  );

  totalPromptTokens += style.usage.promptTokens;
  totalCompletionTokens += style.usage.completionTokens;

  const designTokens =
    opts.existingDesignTokens ?? style.data?.designTokens ?? null;

  /* ----------------------------------------------------------
     4️⃣ REFINE
  ---------------------------------------------------------- */
  const refine = await callLLM(
    SYSTEM_REFINE,
    JSON.stringify({
      blueprint,
      designTokens,
    })
  );

  totalPromptTokens += refine.usage.promptTokens;
  totalCompletionTokens += refine.usage.completionTokens;

  blueprint = refine.data;

  if (!blueprint || blueprint.type !== "page") {
    throw new Error("Refine stage returned invalid blueprint");
  }

  /* ----------------------------------------------------------
     FINAL
  ---------------------------------------------------------- */
  return {
    blueprint,
    pages,
    designTokens,
    usage: {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
    },
  };
}
