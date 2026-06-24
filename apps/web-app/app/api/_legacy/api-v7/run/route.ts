// /Users/kailash/buildez/apps/web-app/app/api/api-v7/run/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/getAuthContext";
import { runAIV7 } from "@/modules/builder/ai-v7/runAIV7";
import { generateImage } from "../_lib/generateImage";

const FALLBACK_IMAGE = "https://placehold.co/800x450/e2e8f0/64748b?text=Image";

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();

  if (!auth?.userId || !auth?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ✅ FIX: Read both "prompt" and "userPrompt" for backward compatibility
  const userPrompt = body.userPrompt || body.prompt;
  const { brandContext, siteId } = body;

  // Validate prompt
  if (!userPrompt || typeof userPrompt !== "string") {
    return NextResponse.json(
      { 
        error: "userPrompt is required",
        received: {
          hasPrompt: !!body.prompt,
          hasUserPrompt: !!body.userPrompt,
          bodyKeys: Object.keys(body),
        }
      },
      { status: 400 }
    );
  }

  console.log("=".repeat(70));
  console.log("📥 [API-V7] Request received");
  console.log("=".repeat(70));
  console.log("User Prompt:", userPrompt.substring(0, 100) + "...");
  console.log("Site ID:", siteId || "not provided");
  console.log("Has Brand Context:", !!brandContext);
  console.log("Brand Context:", {
    hasLogo: !!brandContext?.logoUrl,
    hasColors: !!brandContext?.designTokens?.colors,
  });
  console.log("=".repeat(70));

  try {
    // ✅ FIX: Call runAIV7 with correct parameter names
    const blueprint = await runAIV7({
      userPrompt,  // ✅ Correct key!
      brandContext: brandContext ?? undefined,
      siteId: siteId ?? undefined,

      generateImage: async (imagePrompt: string) => {
        console.log("🖼️ [Route] Generating image for:", imagePrompt.substring(0, 80));
        console.log("🖼️ [Route] Site ID:", siteId || "not provided");

        try {
          const url = await generateImage(imagePrompt, siteId);

          if (url) {
            console.log("🖼️ [Route] ✅ Image generated:", url.substring(0, 80));
            return url;
          }

          console.warn("🖼️ [Route] ⚠️ No URL returned, using fallback");
          return FALLBACK_IMAGE;
        } catch (err: any) {
          console.error("🖼️ [Route] ❌ Image generation error:", err.message);
          return FALLBACK_IMAGE;
        }
      },
    });

    console.log("=".repeat(70));
    console.log("✅ [API-V7] Blueprint generated successfully");
    console.log("=".repeat(70));
    console.log("Blueprint Stats:", {
      type: blueprint.type,
      sectionsCount: blueprint.children?.length || 0,
      hasDesignTokens: !!blueprint.props?.designTokens,
    });
    console.log("=".repeat(70));

    // ✅ FIX: Return "page" instead of "blueprint" to match client expectation
    return NextResponse.json({ 
      page: blueprint,
      success: true 
    });
  } catch (err: any) {
    console.error("=".repeat(70));
    console.error("❌ [API-V7] Generation failed");
    console.error("=".repeat(70));
    console.error("Error:", err.message);
    console.error("Stack:", err.stack?.substring(0, 500));
    console.error("=".repeat(70));

    return NextResponse.json(
      { 
        error: "AI generation failed", 
        details: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
