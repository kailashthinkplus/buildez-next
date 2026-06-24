// /Users/kailash/buildez/apps/web-app/app/api/ai-v8/generate-images/route.ts

import { NextRequest, NextResponse } from "next/server";

const FREEPIK_API_KEY = process.env.FREEPIK_API_KEY!;
const FREEPIK_API_URL = "https://api.freepik.com/v1/ai/text-to-image";

interface FreepikImageRequest {
  prompt: string;
  num_images?: number;
  image?: {
    size?: "square" | "portrait" | "landscape";
  };
  styling?: {
    style?: string;
    color?: string;
    lighting?: string;
  };
}

interface ImageGenerationRequest {
  prompts: string[];
  industry: string;
  size?: "square" | "portrait" | "landscape";
}

/* ============================================================
   INDUSTRY-SPECIFIC STYLING
============================================================ */

function getStyleForIndustry(industry: string): string {
  const styles: Record<string, string> = {
    REAL_ESTATE:
      "architectural photography, professional real estate, luxury interior design, modern architecture",
    RESTAURANT:
      "food photography, gourmet cuisine, professional culinary, appetizing presentation",
    SAAS: "modern technology, clean interface, professional software, digital product",
    ECOMMERCE:
      "product photography, e-commerce style, clean background, professional lighting",
    PORTFOLIO:
      "creative design, modern aesthetic, professional portfolio, contemporary art",
    HEALTHCARE:
      "medical photography, healthcare professional, clean clinical environment",
    EDUCATION:
      "educational setting, modern learning environment, professional education",
    FITNESS:
      "fitness photography, gym environment, active lifestyle, health and wellness",
    FINANCE:
      "professional business, corporate environment, financial services, executive style",
    GENERIC: "professional photography, modern style, high quality, clean aesthetic",
  };

  return styles[industry] || styles.GENERIC;
}

function getLightingForIndustry(industry: string): string {
  const lighting: Record<string, string> = {
    REAL_ESTATE: "natural daylight, bright and airy, architectural lighting",
    RESTAURANT: "warm ambient lighting, professional food lighting, cozy atmosphere",
    SAAS: "clean bright lighting, modern office lighting",
    ECOMMERCE: "studio lighting, product photography lighting, professional",
    PORTFOLIO: "creative lighting, artistic style, contemporary",
    HEALTHCARE: "clinical clean lighting, professional medical environment",
    EDUCATION: "bright classroom lighting, natural light",
    FITNESS: "energetic lighting, gym environment, motivational",
    FINANCE: "professional office lighting, corporate environment",
    GENERIC: "natural professional lighting",
  };

  return lighting[industry] || lighting.GENERIC;
}

/* ============================================================
   FREEPIK API CALL
============================================================ */

async function generateSingleImage(
  prompt: string,
  industry: string,
  size: "square" | "portrait" | "landscape" = "landscape",
  index: number
): Promise<{ prompt: string; url: string | null; error?: string; index: number }> {
  try {
    console.log(`[Freepik] 🎨 Generating image ${index + 1}: "${prompt.substring(0, 50)}..."`);

    const requestBody: FreepikImageRequest = {
      prompt: `${prompt}, ${getStyleForIndustry(industry)}`,
      num_images: 1,
      image: {
        size: size,
      },
      styling: {
        style: getStyleForIndustry(industry),
        lighting: getLightingForIndustry(industry),
      },
    };

    const response = await fetch(FREEPIK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": FREEPIK_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Freepik] ❌ API error ${response.status}:`, errorText);
      throw new Error(`Freepik API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Freepik API response structure may vary - adjust based on actual API docs
    const imageUrl = data.data?.[0]?.image?.url || data.data?.[0]?.url || null;

    if (!imageUrl) {
      console.warn(`[Freepik] ⚠️ No image URL in response for image ${index + 1}`);
      return {
        prompt,
        url: null,
        error: "No image URL returned",
        index,
      };
    }

    console.log(`[Freepik] ✅ Image ${index + 1} generated successfully`);

    return {
      prompt,
      url: imageUrl,
      index,
    };
  } catch (error: any) {
    console.error(`[Freepik] ❌ Image ${index + 1} failed:`, error.message);
    return {
      prompt,
      url: null,
      error: error.message,
      index,
    };
  }
}

/* ============================================================
   API HANDLER
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body: ImageGenerationRequest = await req.json();
    const { prompts, industry, size = "landscape" } = body;

    // Validation
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: "prompts array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!industry) {
      return NextResponse.json(
        { error: "industry is required" },
        { status: 400 }
      );
    }

    if (!FREEPIK_API_KEY) {
      console.error("[Freepik] ❌ FREEPIK_API_KEY not configured");
      return NextResponse.json(
        { error: "Freepik API key not configured" },
        { status: 500 }
      );
    }

    console.log(`[Freepik] 🚀 Starting generation of ${prompts.length} images for ${industry}`);
    const startTime = Date.now();

    // Generate images in parallel (max 3 concurrent to avoid rate limits)
    const batchSize = 3;
    const results: Array<{
      prompt: string;
      url: string | null;
      error?: string;
      index: number;
    }> = [];

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((prompt, batchIndex) =>
          generateSingleImage(prompt, industry, size, i + batchIndex)
        )
      );
      results.push(...batchResults);
    }

    const generationTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.url).length;
    const failedCount = results.length - successCount;

    console.log(
      `[Freepik] ✅ Completed: ${successCount} successful, ${failedCount} failed in ${generationTime}ms`
    );

    // Log failed images
    if (failedCount > 0) {
      results
        .filter((r) => !r.url)
        .forEach((r) => {
          console.warn(`[Freepik] ⚠️ Failed: "${r.prompt}" - ${r.error}`);
        });
    }

    return NextResponse.json({
      success: true,
      images: results,
      metadata: {
        total: prompts.length,
        successful: successCount,
        failed: failedCount,
        generationTime,
        industry,
      },
    });
  } catch (error: any) {
    console.error("[Freepik] ❌ Generation failed:", error);
    return NextResponse.json(
      {
        error: error.message || "Image generation failed",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   HEALTH CHECK ENDPOINT (Optional)
============================================================ */

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "Freepik AI Image Generation",
    apiKeyConfigured: !!FREEPIK_API_KEY,
    endpoint: FREEPIK_API_URL,
  });
}
