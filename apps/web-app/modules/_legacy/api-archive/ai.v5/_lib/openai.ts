// /Users/kailash/buildez/apps/web-app/app/api/ai/_lib/openai.ts

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================================================
   CANONICAL GPT-5 CALL (RESPONSES API — JSON OBJECT)
   - Logs RAW model output
   - Logs parsed text
   - Logs token usage
   - ZERO mutation of response
============================================================ */

export async function callAI({
  system,
  user,
  maxTokens,
}: {
  system: string;
  user: string;
  maxTokens: number;
}) {
  console.group("🧠 [AI REQUEST]");
  console.log("Model:", "gpt-5.1");
  console.log("Max output tokens:", maxTokens);
  console.log("System prompt length:", system.length);
  console.log("User prompt length:", user.length);
  console.groupEnd();

  const res = await openai.responses.create({
    model: "gpt-5.1",

    // GPT-5 token control
    max_output_tokens: maxTokens,

    // ✅ Correct for Responses API
    text: {
      format: { type: "json_object" },
    },

    input: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
  });

  /* ----------------------------------------------------------
     RAW OPENAI RESPONSE (STRUCTURAL)
  ---------------------------------------------------------- */

  console.group("📦 [OPENAI RAW RESPONSE]");
  console.log("Response ID:", res.id);
  console.log("Output array:", res.output);
  console.log("Usage:", res.usage);
  console.groupEnd();

  /* ----------------------------------------------------------
     EXTRACT TEXT (RESPONSES API)
  ---------------------------------------------------------- */

  const outputText = res.output_text;

  console.group("🧾 [OPENAI OUTPUT TEXT]");
  console.log(outputText);
  console.groupEnd();

  if (!outputText) {
    console.group("❌ [AI ERROR] Empty response text");
    console.log("Full output:", res.output);
    console.log("Usage:", res.usage);
    console.groupEnd();
    throw new Error("Empty AI response");
  }

  /* ----------------------------------------------------------
     JSON SANITY CHECK (NO PARSE, JUST VALIDATION)
  ---------------------------------------------------------- */

  try {
    JSON.parse(outputText);
    console.log("✅ [AI] Output is valid JSON");
  } catch (err) {
    console.error("❌ [AI] Output is NOT valid JSON");
    console.error(outputText);
    throw new Error("AI returned invalid JSON");
  }

  return {
    text: outputText,
    usage: res.usage ?? null,
  };
}
