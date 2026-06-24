import { callAI } from "../_lib/openai";
import { parseActions } from "../_lib/parseActions";

/* ============================================================
   LAYOUT STAGE — STRUCTURE ONLY (SAFE)
============================================================ */

const SYSTEM = `
You are BuildEZ AI — LAYOUT STAGE.

ABSOLUTE RULES:
- Return ONLY valid JSON
- No markdown
- No comments
- No explanations

OUTPUT FORMAT (MANDATORY):
{
  "actions": [
    {
      "type": "insert-child",
      "parentId": "page",
      "node": {
        "type": "section",
        "props": {},
        "children": []
      }
    }
  ]
}

LAYOUT RULES:
- Generate AT MOST 3 sections
- Each section MUST have:
  section → container → column
- Columns MUST be EMPTY (no children)
- Do NOT add text, images, buttons
- Do NOT invent many IDs
- Keep output SMALL

ALLOWED SECTIONS:
- Hero
- Features OR Services
- About OR CTA
`;

export async function runLayoutStage(payload: {
  intent: string;
}) {
  console.group("[AI LAYOUT STAGE]");
  console.log("Intent:", payload.intent);

  const { text, usage } = await callAI({
    system: SYSTEM,
    user: payload.intent,
    maxTokens: 350, // 🔒 HARD SAFE LIMIT
  });

  console.log("Raw AI response ↓↓↓");
  console.log(text);
  console.log("Token usage:", usage);
  console.groupEnd();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.group("[AI LAYOUT PARSE ERROR]");
    console.log(text);
    console.groupEnd();
    throw new Error("AI returned invalid JSON in layout stage");
  }

  if (!Array.isArray(parsed.actions)) {
    throw new Error("Layout stage response missing actions");
  }

  console.log(
    "[AI LAYOUT] actions count:",
    parsed.actions.length
  );

  return {
    actions: parseActions(
      JSON.stringify({ actions: parsed.actions })
    ),
  };
}
