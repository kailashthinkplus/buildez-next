/* ============================================================
   SHARED OPENAI CLIENT
   - Used by AI-V6 and future versions
   - Single source of truth
============================================================ */

import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "[AI] OPENAI_API_KEY is not set. AI routes will fail."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
