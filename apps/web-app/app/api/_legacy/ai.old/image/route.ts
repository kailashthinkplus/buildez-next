// /app/api/ai/image/route.ts

import { NextResponse } from "next/server";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

/* ============================================================
   ENV VALIDATION (FAIL FAST)
============================================================ */

if (
  !process.env.R2_ENDPOINT ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET ||
  !process.env.R2_PUBLIC_URL ||
  !process.env.FREEPIK_API_KEY
) {
  console.error("❌ Missing required environment variables for AI image route");
  throw new Error("AI image environment not configured");
}

/* ============================================================
   R2 CLIENT (SINGLETON)
============================================================ */

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/* ============================================================
   CONSTANTS / LIMITS
============================================================ */

const MAX_PROMPT_LENGTH = 500;
const MAX_OUTPUT_SIZE = 2400; // px
const WEBP_QUALITY = 88;

const ALLOWED_SIZES = ["512x512", "768x768", "1024x1024"];

/* ============================================================
   UTILS
============================================================ */

function generateKey(siteId?: string) {
  const id = crypto.randomUUID();
  return `sites/${siteId ?? "global"}/ai/${id}.webp`;
}

/* ============================================================
   API HANDLER
============================================================ */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[AI:image] Request body received");

    const { prompt, siteId, size = "1024x1024" } = body ?? {};

    /* --------------------------------------------------------
       HARD GUARDS
    -------------------------------------------------------- */

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: "Prompt too long" },
        { status: 413 }
      );
    }

    if (!ALLOWED_SIZES.includes(size)) {
      return NextResponse.json(
        { error: "Unsupported image size" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------
       1️⃣ CALL FREEPIK (TEXT → IMAGE)
    -------------------------------------------------------- */

    console.log("[AI:image] Calling Freepik…");

    const aiRes = await fetch(
      "https://api.freepik.com/v1/ai/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Freepik-API-Key": process.env.FREEPIK_API_KEY,
        },
        body: JSON.stringify({
          prompt,
          num_images: 1,
          image_size: size,
        }),
        cache: "no-store",
      }
    );

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("[AI:image] ❌ Freepik error:", errText);
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 502 }
      );
    }

    const aiData = await aiRes.json();
    const base64 = aiData?.data?.[0]?.base64;

    if (!base64 || typeof base64 !== "string") {
      console.error("[AI:image] ❌ No base64 image returned", aiData);
      return NextResponse.json(
        { error: "No image returned from generator" },
        { status: 502 }
      );
    }

    /* --------------------------------------------------------
       2️⃣ BASE64 → BUFFER
    -------------------------------------------------------- */

    const originalBuffer = Buffer.from(base64, "base64");

    /* --------------------------------------------------------
       3️⃣ NORMALIZE → WEBP (DETERMINISTIC)
    -------------------------------------------------------- */

    const webpBuffer = await sharp(originalBuffer)
      .resize(MAX_OUTPUT_SIZE, MAX_OUTPUT_SIZE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    /* --------------------------------------------------------
       4️⃣ UPLOAD TO R2 (IMMUTABLE)
    -------------------------------------------------------- */

    const key = generateKey(siteId);

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: webpBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    console.log("[AI:image] ✅ Uploaded:", publicUrl);

    /* --------------------------------------------------------
       5️⃣ RESPONSE
    -------------------------------------------------------- */

    return NextResponse.json({
      imageUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("[AI:image] ❌ Pipeline error:", error?.message || error);

    return NextResponse.json(
      { error: "AI image processing failed" },
      { status: 500 }
    );
  }
}
