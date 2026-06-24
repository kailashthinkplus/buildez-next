// /Users/kailash/buildez/apps/web-app/app/api/api-v7/_lib/generateImage.ts

import { nanoid } from "nanoid";
import { uploadToR2 } from "@/app/app/(builder)/media/cloudflareR2";
import { callFreepikAI } from "./freepik";

const MAX_RETRIES = 2;
const FALLBACK_IMAGE = "https://placehold.co/800x450/e2e8f0/94a3b8?text=Image";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * Freepik Image Generator
 * - Calls Freepik API
 * - Uploads result to R2
 * - Returns public CDN URL
 * - Never throws
 */
export async function generateImage(
  prompt: string,
  siteId?: string
): Promise<string> {
  const requestId = Math.random().toString(36).slice(2, 8);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎨 [ImageGen][${requestId}] GENERATE IMAGE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`🎨 [ImageGen][${requestId}] Prompt:`, prompt.substring(0, 100));
  console.log(`🎨 [ImageGen][${requestId}] Site ID:`, siteId || "global");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`🎨 [ImageGen][${requestId}] Attempt ${attempt}/${MAX_RETRIES}`);

    try {
      const res = await callFreepikAI({
        endpoint: "/text-to-image",
        body: {
          prompt,
          negative_prompt: "blurry, low quality, distorted, watermark, text overlay, logo, badge",
          num_images: 1,
          guidance_scale: 7.5,
          image: {
            size: "landscape_16_9",
          },
          styling: {
            style: "photo",
            color: "vibrant",
            lightning: "studio",
            framing: "wide",
          },
        },
      });

      console.log(`🎨 [ImageGen][${requestId}] Response keys:`, Object.keys(res || {}));

      // Check for error response
      if (res?.error) {
        console.warn(`🎨 [ImageGen][${requestId}] ⚠️ API error:`, res.message || res.error);
        continue;
      }

      // Extract image from response
      const extracted = extractImageFromResponse(res, requestId);

      if (!extracted) {
        console.warn(`🎨 [ImageGen][${requestId}] ⚠️ Could not extract image from response`);
        continue;
      }

      // If it's already a URL, return it directly
      if (extracted.type === "url") {
        console.log(`🎨 [ImageGen][${requestId}] ✅ Got direct URL:`, extracted.data.substring(0, 100));
        return extracted.data;
      }

      // It's base64 - upload to R2
      console.log(`🎨 [ImageGen][${requestId}] 📤 Uploading base64 to R2...`);

      const publicUrl = await uploadBase64ToR2(
        extracted.data,
        extracted.mimeType || "image/jpeg",
        siteId,
        requestId
      );

      if (publicUrl) {
        console.log(`🎨 [ImageGen][${requestId}] ✅ SUCCESS! URL:`, publicUrl);
        return publicUrl;
      }

      console.warn(`🎨 [ImageGen][${requestId}] ⚠️ R2 upload failed`);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`🎨 [ImageGen][${requestId}] ❌ Exception:`, message);
    }
  }

  console.error(`🎨 [ImageGen][${requestId}] ❌ FAILED after ${MAX_RETRIES} attempts, using fallback`);
  return FALLBACK_IMAGE;
}

/* ============================================================
   EXTRACT IMAGE FROM FREEPIK RESPONSE
============================================================ */

interface ExtractedImage {
  type: "url" | "base64";
  data: string;
  mimeType?: string;
}

function extractImageFromResponse(
  res: unknown,
  requestId: string
): ExtractedImage | null {
  if (!res || typeof res !== "object") {
    return null;
  }

  const response = res as Record<string, unknown>;

  // Structure 1: { data: [{ url: "https://..." }] }
  if (Array.isArray(response.data) && response.data[0]) {
    const firstItem = response.data[0] as Record<string, unknown>;

    // Check for direct URL first (preferred)
    if (typeof firstItem.url === "string" && firstItem.url.startsWith("http")) {
      console.log(`🎨 [ImageGen][${requestId}] Found URL in data[0].url`);
      return { type: "url", data: firstItem.url };
    }

    // Check for base64
    if (typeof firstItem.base64 === "string") {
      console.log(`🎨 [ImageGen][${requestId}] Found base64 in data[0].base64`);
      return {
        type: "base64",
        data: firstItem.base64,
        mimeType: detectMimeType(firstItem.base64),
      };
    }
  }

  // Structure 2: { images: [{ url: "..." }] } or { images: ["url"] }
  if (Array.isArray(response.images) && response.images[0]) {
    const firstImage = response.images[0];

    if (typeof firstImage === "string" && firstImage.startsWith("http")) {
      console.log(`🎨 [ImageGen][${requestId}] Found URL in images[0]`);
      return { type: "url", data: firstImage };
    }

    if (typeof firstImage === "object" && firstImage !== null) {
      const img = firstImage as Record<string, unknown>;
      if (typeof img.url === "string") {
        console.log(`🎨 [ImageGen][${requestId}] Found URL in images[0].url`);
        return { type: "url", data: img.url };
      }
    }
  }

  // Structure 3: { url: "..." } or { image_url: "..." }
  if (typeof response.url === "string" && response.url.startsWith("http")) {
    console.log(`🎨 [ImageGen][${requestId}] Found URL in root.url`);
    return { type: "url", data: response.url };
  }

  if (typeof response.image_url === "string" && response.image_url.startsWith("http")) {
    console.log(`🎨 [ImageGen][${requestId}] Found URL in root.image_url`);
    return { type: "url", data: response.image_url };
  }

  // Structure 4: { output: { url: "..." } }
  if (response.output && typeof response.output === "object") {
    const output = response.output as Record<string, unknown>;
    if (typeof output.url === "string") {
      console.log(`🎨 [ImageGen][${requestId}] Found URL in output.url`);
      return { type: "url", data: output.url };
    }
  }

  // Structure 5: { image: "base64..." } (root level base64)
  if (typeof response.image === "string" && !response.image.startsWith("http")) {
    console.log(`🎨 [ImageGen][${requestId}] Found base64 in root.image`);
    return {
      type: "base64",
      data: response.image,
      mimeType: detectMimeType(response.image),
    };
  }

  return null;
}

/* ============================================================
   UPLOAD BASE64 TO R2
============================================================ */

async function uploadBase64ToR2(
  base64: string,
  mimeType: string,
  siteId: string | undefined,
  requestId: string
): Promise<string | null> {
  try {
    // Clean base64 (remove data URL prefix if present)
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

    // Convert to buffer
    const buffer = Buffer.from(cleanBase64, "base64");

    // Get extension from mime type
    const extension = mimeType.split("/")[1] || "jpg";

    // Generate unique path
    const folder = siteId ? `sites/${siteId}/ai-images` : "ai-images";
    const path = `${folder}/${Date.now()}-${nanoid()}.${extension}`;

    console.log(`🎨 [ImageGen][${requestId}] R2 path:`, path);
    console.log(`🎨 [ImageGen][${requestId}] Content-Type:`, mimeType);
    console.log(`🎨 [ImageGen][${requestId}] Buffer size:`, buffer.length, "bytes");

    // Upload using existing utility
    await uploadToR2(buffer, path, mimeType);

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${path}`;
    console.log(`🎨 [ImageGen][${requestId}] ✅ Uploaded to R2:`, publicUrl);

    return publicUrl;

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`🎨 [ImageGen][${requestId}] ❌ R2 upload failed:`, message);
    return null;
  }
}

/* ============================================================
   DETECT MIME TYPE FROM BASE64
============================================================ */

function detectMimeType(base64: string): string {
  const header = base64.substring(0, 10);

  // JPEG: starts with /9j/
  if (header.startsWith("/9j/")) return "image/jpeg";

  // PNG: starts with iVBOR
  if (header.startsWith("iVBOR")) return "image/png";

  // WebP: starts with UklGR
  if (header.startsWith("UklGR")) return "image/webp";

  // GIF: starts with R0lGOD
  if (header.startsWith("R0lGOD")) return "image/gif";

  // Default to JPEG
  return "image/jpeg";
}