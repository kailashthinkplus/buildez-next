import { callAI } from "../_lib/openai";
import { parseActions } from "../_lib/parseActions";

/* ============================================================
   CONTENT STAGE — TEXT ONLY (SAFE, LIMITED)
============================================================ */

const SYSTEM = `
You are BuildEZ AI — CONTENT STAGE.

ABSOLUTE RULES:
- Return ONLY valid JSON
- No markdown
- No comments
- No explanations

OUTPUT FORMAT (MANDATORY):
{
  "actions": [
    {
      "type": "update-node",
      "nodeId": "string",
      "patch": {
        "text": "string"
      }
    }
  ]
}

CONTENT RULES:
- Generate AT MOST 5 actions
- Focus ONLY on the main hero section
- Allowed nodes:
  - hero title
  - hero subtitle
  - primary CTA
  - secondary CTA
- Do NOT update navigation
- Do NOT update forms
- Do NOT update footers
- Do NOT invent many nodeIds
- Keep copy concise and premium
`;

export async function runContentStage(payload: {
  intent: string;
}) {
  console.group("[AI CONTENT STAGE]");
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

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.group("[AI CONTENT PARSE ERROR]");
    console.log(text);
    console.groupEnd();
    throw new Error("AI returned invalid JSON in content stage");
  }

  if (!Array.isArray(parsed.actions)) {
    throw new Error("Content stage response missing actions");
  }

  console.log(
    "[AI CONTENT] actions count:",
    parsed.actions.length
  );

  return {
    actions: parseActions(parsed),
  };
}
