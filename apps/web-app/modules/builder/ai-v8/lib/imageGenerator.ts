// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/lib/imageGenerator.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=900&fit=crop&auto=format";

// ✅ R2 Client - Fixed environment variable names
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!, // Changed from CLOUDFLARE_R2_ENDPOINT
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!, // Changed from CLOUDFLARE_R2_ACCESS_KEY_ID
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, // Changed from CLOUDFLARE_R2_SECRET_ACCESS_KEY
  },
});

const R2_BUCKET = process.env.R2_BUCKET!; // Changed from CLOUDFLARE_R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // Changed from CLOUDFLARE_R2_PUBLIC_URL

export async function generateImageWithR2(prompt: string, siteId?: string): Promise<string> {
  console.log("[Image] Generating:", prompt.substring(0, 80));

  try {
    // Call Freepik API
    const base64 = await callFreepikAPI(prompt);
    
    // Upload to R2
    const buffer = Buffer.from(base64, "base64");
    const filename = `ai-v8/${siteId || "default"}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    console.log("[Image] Uploading to R2:", filename);
    
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: "image/jpeg",
    }));

    const url = `${R2_PUBLIC_URL}/${filename}`;
    console.log("[Image] ✅ Uploaded to R2:", url);
    
    return url;
  } catch (error: any) {
    console.error("[Image] ❌ Failed:", error.message);
    console.error("[Image] Stack:", error.stack);
    return FALLBACK_IMAGE;
  }
}

async function callFreepikAPI(prompt: string): Promise<string> {
  const apiKey = process.env.FREEPIK_API_KEY;
  
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY not configured");
  }

  console.log("[Freepik] Calling API with prompt:", prompt.substring(0, 60));

  // Enhanced photorealistic prompt
  const enhancedPrompt = `Professional photography, photorealistic, high quality, sharp focus, natural lighting, ${prompt}`;

  const res = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      negative_prompt: "illustration, drawing, painting, sketch, cartoon, anime, 3d render, digital art, abstract, artistic, stylized, unrealistic, blurry, low quality, watermark, text, logo",
      guidance_scale: 8.5,
      seed: Math.floor(Math.random() * 1000000),
      num_images: 1,
      image: {
        size: "landscape_16_9",
      },
      styling: {
        style: "photo",
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[Freepik] API Error:", res.status, errorText);
    throw new Error(`Freepik API error: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  console.log("[Freepik] Response received");

  // Extract base64 from various response structures
  let base64: string | null = null;

  if (Array.isArray(json.data) && json.data[0]?.base64) {
    base64 = json.data[0].base64;
  } else if (json.data?.image) {
    base64 = json.data.image;
  } else if (json.image) {
    base64 = json.image;
  }

  if (!base64) {
    console.error("[Freepik] Response structure:", JSON.stringify(json).substring(0, 200));
    throw new Error("No base64 image data in Freepik response");
  }

  console.log("[Freepik] ✅ Base64 received, length:", base64.length);

  // Remove data URL prefix if present
  return base64.replace(/^data:image\/\w+;base64,/, "");
}
