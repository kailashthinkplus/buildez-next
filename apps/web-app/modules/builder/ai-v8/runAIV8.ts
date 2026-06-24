// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/runAIV8.ts

import type { AIV8BrandContext, AIV8Result } from "./types";
import { generateHTML } from "./lib/htmlGenerator";
import { validateHTML } from "./lib/htmlValidator";

export async function runAIV8({
  userPrompt,
  brandContext,
  generateImage,
  siteId,
  format = "html",
}: {
  userPrompt: string;
  brandContext?: AIV8BrandContext;
  generateImage: (prompt: string) => Promise<string>;
  siteId?: string;
  format?: "html" | "both";
}): Promise<AIV8Result> {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 AI V8 HTML GENERATION STARTED");
  console.log("=".repeat(70));
  console.log("Prompt:", userPrompt.substring(0, 100));
  console.log("Site ID:", siteId || "none");
  console.log("=".repeat(70) + "\n");

  try {
    // Generate HTML
    console.log("[AI-V8] 1️⃣ Generating HTML...");
    const html = await generateHTML({ userPrompt, brandContext, generateImage, siteId });
    console.log("[AI-V8] ✅ HTML generated:", html.length, "characters");

    // Validate
    console.log("[AI-V8] 2️⃣ Validating...");
    const validation = validateHTML(html);
    if (!validation.valid) {
      console.warn("[AI-V8] ⚠️ Warnings:", validation.warnings);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ AI V8 COMPLETED SUCCESSFULLY");
    console.log("=".repeat(70) + "\n");

    return {
      html,
      metadata: {
        generatedAt: new Date().toISOString(),
        format,
        validation,
      },
    };
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ AI V8 FAILED");
    console.error("Error:", error);
    console.error("=".repeat(70) + "\n");
    throw error;
  }
}
