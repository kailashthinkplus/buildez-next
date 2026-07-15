import { callAI } from "../_lib/openai";

/* ============================================================
   STYLE STAGE — DESIGN TOKENS ONLY (LOCKED)
============================================================ */

const SYSTEM = `
You are BuildEZ AI — STYLE STAGE.

ABSOLUTE RULES:
- Return ONLY valid JSON
- No markdown
- No comments
- No explanations
- Do NOT ask questions
- Be concise

OUTPUT FORMAT (MANDATORY):
{
  "designTokens": {
    "colors": {
      "primary": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "textPrimary": "#hex"
    },
    "typography": {
      "fontFamily": "string",
      "baseFontSize": number,
      "headingScale": number
    },
    "spacing": {
      "xs": number,
      "sm": number,
      "md": number,
      "lg": number,
      "xl": number
    }
  }
}

STYLE RULES:
- Prefer safe, neutral defaults
- Do NOT invent many variations
- Keep values minimal and consistent
- Colors must be valid hex values
- Numbers only (no px, rem, em)
- Do NOT include layout or content
`;

export async function runStyleStage(payload: { intent: string }) {
  console.group("[AI STYLE STAGE]");
  console.log("Intent:", payload.intent);

  const { text, usage } = await callAI({
    system: SYSTEM,
    user: payload.intent,
    maxTokens: 250, // 🔒 HARD SAFE LIMIT
  });

  console.log("Raw AI response ↓↓↓");
  console.log(text);
  console.log("Token usage:", usage);
  console.groupEnd();

  /* ----------------------------------------------------------
     HARD JSON PARSE
  ---------------------------------------------------------- */

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.group("[AI STYLE PARSE ERROR]");
    console.log(text);
    console.groupEnd();
    throw new Error("AI returned invalid JSON in style stage");
  }

  /* ----------------------------------------------------------
     SHAPE VALIDATION
  ---------------------------------------------------------- */

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !parsed.designTokens ||
    typeof parsed.designTokens !== "object"
  ) {
    throw new Error("Style stage response missing designTokens");
  }

  console.log(
    "[AI STYLE] designTokens keys:",
    Object.keys(parsed.designTokens)
  );

  return {
    designTokens: parsed.designTokens,
  };
}
