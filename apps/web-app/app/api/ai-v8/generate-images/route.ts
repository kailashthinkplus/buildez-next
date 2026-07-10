// /Users/kailash/buildez/apps/web-app/app/api/ai-v8/generate-images/route.ts

import { NextRequest, NextResponse } from "next/server";

const MAGNIFIC_API_KEY =
  process.env.MAGNIFIC_API_KEY?.trim() || process.env.FREEPIK_API_KEY?.trim() || "";
const FREEPIK_API_URL = "https://api.freepik.com/v1/ai/text-to-image";

interface FreepikImageRequest {
  prompt: string;
  negative_prompt?: string;
  guidance_scale?: number;
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
  siteId?: string;
}

/* ============================================================
   INDUSTRY-SPECIFIC STYLING
============================================================ */

function getStyleForIndustry(industry: string): string {
  const normalized = industry.trim().toUpperCase().replace(/[\s-]+/g, "_");
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

  return styles[normalized] || styles.GENERIC;
}

function getLightingForIndustry(industry: string): string {
  const normalized = industry.trim().toUpperCase().replace(/[\s-]+/g, "_");
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

  return lighting[normalized] || lighting.GENERIC;
}

function extractFreepikUrl(data: any) {
  const candidates = [
    data?.data?.[0]?.image?.url,
    data?.data?.[0]?.url,
    data?.data?.[0]?.image_url,
    data?.images?.[0]?.url,
    data?.url,
  ];

  return candidates.find(
    (value) => typeof value === "string" && /^https?:\/\//i.test(value)
  ) || null;
}

function extractFreepikBase64(data: any) {
  const candidates = [
    data?.data?.[0]?.b64_json,
    data?.data?.[0]?.base64,
    data?.data?.[0]?.image?.base64,
    data?.images?.[0]?.base64,
    data?.image,
  ];

  const found = candidates.find(
    (value) => typeof value === "string" && value.length > 100
  );

  return found ? found.replace(/^data:image\/\w+;base64,/, "") : null;
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
    console.log(`[Magnific] 🎨 Generating image ${index + 1}: "${prompt.substring(0, 50)}..."`);

    const requestBody: FreepikImageRequest = {
      prompt: [
        "Photorealistic commercial photography",
        "realistic environment, natural color grading, sharp focus, premium website visual",
        prompt,
        getStyleForIndustry(industry),
        "no text, no watermark, avoid vector art, avoid clipart, avoid heavy yellow or orange color cast",
      ].join(", "),
      negative_prompt:
        "illustration, vector art, flat vector, drawing, painting, sketch, cartoon, anime, 3d render, digital art, abstract, artistic, stylized, unrealistic, blurry, low quality, watermark, text, logo, yellow tint, orange tint, mustard background, oversaturated yellow",
      guidance_scale: 6.5,
      num_images: 1,
      image: {
        size: size,
      },
    };

    const response = await fetch(FREEPIK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": MAGNIFIC_API_KEY,
        "x-magnific-api-key": MAGNIFIC_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Magnific] ❌ API error ${response.status}:`, errorText);
      throw new Error(`Magnific API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const imageUrl = extractFreepikUrl(data);
    const base64 = extractFreepikBase64(data);

    if (!imageUrl && !base64) {
      console.warn(`[Magnific] ⚠️ No image URL in response for image ${index + 1}`);
      return {
        prompt,
        url: null,
        error: "No image URL returned",
        index,
      };
    }

    console.log(`[Magnific] ✅ Image ${index + 1} generated successfully`);

    return {
      prompt,
      url: imageUrl || `data:image/jpeg;base64,${base64}`,
      index,
    };
  } catch (error: any) {
    console.error(`[Magnific] ❌ Image ${index + 1} failed:`, error.message);
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

    if (!MAGNIFIC_API_KEY) {
      console.error("[Magnific] ❌ MAGNIFIC_API_KEY or FREEPIK_API_KEY not configured");
      return NextResponse.json(
        { error: "Magnific/Freepik API key not configured" },
        { status: 500 }
      );
    }

    console.log(`[Magnific] 🚀 Starting generation of ${prompts.length} images for ${industry}`);
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
      `[Magnific] ✅ Completed: ${successCount} successful, ${failedCount} failed in ${generationTime}ms`
    );

    // Log failed images
    if (failedCount > 0) {
      results
        .filter((r) => !r.url)
        .forEach((r) => {
          console.warn(`[Magnific] ⚠️ Failed: "${r.prompt}" - ${r.error}`);
        });
    }

    return NextResponse.json({
      success: successCount > 0,
      ...(successCount === 0
        ? { error: results[0]?.error || "Image generation failed" }
        : {}),
      images: results,
      metadata: {
        total: prompts.length,
        successful: successCount,
        failed: failedCount,
        generationTime,
        industry,
      },
    }, { status: successCount > 0 ? 200 : 502 });
  } catch (error: any) {
    console.error("[Magnific] ❌ Generation failed:", error);
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
    service: "Magnific AI Image Generation",
    apiKeyConfigured: !!MAGNIFIC_API_KEY,
    endpoint: FREEPIK_API_URL,
  });
}
