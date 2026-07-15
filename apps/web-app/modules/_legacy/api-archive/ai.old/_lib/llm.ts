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
   SYSTEM PROMPT — FULL BLUEPRINT GENERATION (V4 HARD-LOCKED)
--------------------------------------------------------------------------- */
const SYSTEM_PROMPT = `
You are BuildEZ AI — a professional, Webflow-level website layout engine.

Your task is to generate a COMPLETE, VALID BlueprintNode tree
for a STATIC MARKETING WEBSITE.

STRICT RULES (NON-NEGOTIABLE):
- Output ONLY valid JSON
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include comments
- Do NOT wrap output in \`\`\`
- Root node MUST be type "page"
- Every node MUST include: id, type, props, children
- IDs must be unique strings

ALLOWED NODE TYPES ONLY:
page
section
container
column
text
heading
button
image
spacer

STYLE GUIDELINES:
- Modern SaaS / startup aesthetic
- Clean spacing
- Grid-based layouts
- Strong typography hierarchy
- Conversion-focused sections

ABSOLUTELY DO NOT:
- Return patches
- Return diffs
- Return arrays at root
- Return text outside JSON

Your response MUST be a SINGLE JSON OBJECT.
`;

/* ---------------------------------------------------------------------------
   SAFE JSON EXTRACTION
--------------------------------------------------------------------------- */
function extractJSON(raw: string): any {
  // Match the first valid JSON object
  const match = raw.match(/\{[\s\S]*\}/);

  if (!match) {
    console.error("[AI] No JSON object found in response:\n", raw);
    throw new Error("AI returned invalid JSON");
  }

  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("[AI] JSON parse failed:\n", match[0]);
    throw new Error("AI returned invalid JSON");
  }
}

/* ---------------------------------------------------------------------------
   BLUEPRINT GENERATOR (V4 — HARDENED)
--------------------------------------------------------------------------- */
export async function generateBlueprint(
  prompt: string
): Promise<BlueprintNode> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const raw =
      response.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      throw new Error("AI returned empty response");
    }

    const parsed = extractJSON(raw);

    /* -------------------------------------------------------
       HARD STRUCTURAL VALIDATION
    ------------------------------------------------------- */
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.type !== "page"
    ) {
      console.error("[AI] Invalid page blueprint:\n", parsed);
      throw new Error("AI did not return a valid page blueprint");
    }

    if (!Array.isArray(parsed.children)) {
      parsed.children = [];
    }

    return parsed as BlueprintNode;
  } catch (error: any) {
    console.error("[AI] Blueprint generation failed:", error?.message);
    throw new Error(
      `Error generating blueprint: ${error?.message || "Unknown error"}`
    );
  }
}
