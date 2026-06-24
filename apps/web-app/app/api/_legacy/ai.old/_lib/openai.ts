// /app/api/ai/_lib/openai.ts

import OpenAI from "openai";

/* -----------------------------------------------------------
   ENV VALIDATION
----------------------------------------------------------- */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in environment variables");
  throw new Error("Missing OPENAI_API_KEY");
}

/* -----------------------------------------------------------
   OPENAI CLIENT (SINGLETON)
----------------------------------------------------------- */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* -----------------------------------------------------------
   GENERIC TEXT GENERATION (V4 — SAFE, NON-PATCH)
   ⚠️ NOTE:
   - Used ONLY for copy, summaries, outlines, themes
   - NOT for blueprint generation
----------------------------------------------------------- */
export async function generateText({
  prompt,
  maxTokens = 2048,
  temperature = 0.6,
}: {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  console.log("🟦 [AI] generateText()");
  console.log("🟦 Prompt length:", prompt?.length);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content =
      response?.choices?.[0]?.message?.content?.trim() ?? "";

    console.log("🟩 [AI] Text generated. Length:", content.length);

    return content;
  } catch (err: any) {
    console.error(
      "🟥 [AI] OpenAI generateText error:",
      err?.message || err
    );

    // 🔒 Always fail safely (never throw inside routes)
    return "";
  }
}
