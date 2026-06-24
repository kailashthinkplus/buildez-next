import { callAI } from "../_lib/openai";
import { parseActions } from "../_lib/parseActions";

/* ============================================================
   VISUAL STAGE — POLISH ONLY (LOCKED)
============================================================ */

const SYSTEM = `
You are BuildEZ AI — VISUAL POLISH STAGE.

ABSOLUTE RULES:
- Return ONLY valid JSON
- No markdown
- No comments
- No explanations
- Do NOT ask questions
- Be concise

OUTPUT FORMAT (MANDATORY):
{
  "actions": [
    {
      "type": "update-node",
      "nodeId": "string",
      "patch": {
        "padding": number,
        "paddingTop": number,
        "paddingBottom": number,
        "background": "string",
        "imageIntent": "string"
      }
    }
  ]
}

ACTION RULES:
- Allowed action type: update-node ONLY
- Do NOT invent node IDs
- Do NOT change structure
- Do NOT add or remove nodes
- If nothing is needed, return: { "actions": [] }

DESIGN GUIDELINES:
- Add breathing room between sections
- Introduce subtle background contrast
- Improve visual rhythm
- Use imageIntent only for hero / feature sections
`;

export async function runVisualStage(payload: { intent: string }) {
  console.group("[AI VISUAL STAGE]");
  console.log("Intent:", payload.intent);

  const { text, usage } = await callAI({
    system: SYSTEM,
    user: payload.intent,
    maxTokens: 300, // 🔒 HARD SAFE LIMIT
  });

  console.log("Raw AI response ↓↓↓");
  console.log(text);
  console.log("Token usage:", usage);
  console.groupEnd();

  /* ----------------------------------------------------------
     HARD PARSE + VALIDATION
  ---------------------------------------------------------- */

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.group("[AI VISUAL PARSE ERROR]");
    console.log(text);
    console.groupEnd();
    throw new Error("AI returned invalid JSON in visual stage");
  }

  if (!parsed || !Array.isArray(parsed.actions)) {
    throw new Error("Visual stage response missing actions array");
  }

  console.log(
    "[AI VISUAL] actions count:",
    parsed.actions.length
  );

  /* ----------------------------------------------------------
     RETURN ACTIONS (NO STRINGIFY)
  ---------------------------------------------------------- */

  return {
    actions: parseActions(parsed),
  };
}
