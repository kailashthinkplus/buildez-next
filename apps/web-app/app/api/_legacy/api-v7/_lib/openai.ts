import OpenAI from "openai";

/* ============================================================
   OPENAI CLIENT — V7 (LEAF MODULE)
   ⚠️ MUST NOT IMPORT FROM ANY BARREL
============================================================ */

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ------------------------------------------------------------
   DEV GUARD — ENSURE SINGLETON
------------------------------------------------------------ */
if (process.env.NODE_ENV !== "production") {
  console.log("🔌 [AI-V7] OpenAI client initialized");
}
