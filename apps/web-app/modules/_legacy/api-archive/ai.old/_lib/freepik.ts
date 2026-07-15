// /app/api/ai/_lib/freepik.ts

/* -----------------------------------------------------------
   ENV VALIDATION
----------------------------------------------------------- */
if (!process.env.FREEPIK_API_KEY) {
  console.error("❌ Missing FREEPIK_API_KEY in environment variables");
  throw new Error("Missing FREEPIK_API_KEY");
}

/* -----------------------------------------------------------
   CONSTANTS
----------------------------------------------------------- */
const FREEPIK_URL = "https://api.freepik.com/v1/ai/text-to-image";

/* -----------------------------------------------------------
   IMAGE GENERATION (V4 — SAFE, NON-BLOCKING)
   ⚠️ NOTES:
   - Used ONLY for marketing / decorative images
   - NOT for layout logic
   - NOT for blueprint structure
----------------------------------------------------------- */
export async function generateImage(prompt: string): Promise<any | null> {
  console.log("🟦 [AI] generateImage() called");
  console.log("🟦 Prompt:", prompt);

  if (!prompt || typeof prompt !== "string") {
    console.error("🟥 [AI] Invalid image prompt");
    return null;
  }

  try {
    const res = await fetch(FREEPIK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Freepik-API-Key": process.env.FREEPIK_API_KEY!,
      },
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
        style: "photorealistic",
        quality: "high",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🟥 [AI] Freepik API error:", errorText);
      return null; // 🔒 fail safely
    }

    const data = await res.json();

    console.log("🟩 [AI] Freepik image generated");

    return data;
  } catch (err: any) {
    console.error(
      "🟥 [AI] Freepik generateImage failed:",
      err?.message || err
    );

    // 🔒 Never throw inside shared AI helpers
    return null;
  }
}
