// /app/api/ai/image/init/route.ts

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* -----------------------------------------------------------
   ENV VALIDATION (FAIL FAST)
----------------------------------------------------------- */
if (
  !process.env.R2_ENDPOINT ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET ||
  !process.env.R2_PUBLIC_URL
) {
  console.error("❌ Missing one or more R2 environment variables");
  throw new Error("R2 environment variables not configured");
}

/* -----------------------------------------------------------
   R2 CLIENT (SINGLETON)
----------------------------------------------------------- */
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/* -----------------------------------------------------------
   ALLOWED MIME TYPES (SECURITY)
----------------------------------------------------------- */
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/* -----------------------------------------------------------
   POST — INIT PRESIGNED IMAGE UPLOAD
----------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileType } = body ?? {};

    // -------------------------------------------------------
    // HARD GUARDS
    // -------------------------------------------------------
    if (
      !fileName ||
      typeof fileName !== "string" ||
      !fileType ||
      typeof fileType !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fileName or fileType" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Prevent path traversal / unsafe names
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");

    const key = `uploads/${crypto.randomUUID()}-${safeFileName}`;

    // -------------------------------------------------------
    // SIGNED PUT COMMAND
    // -------------------------------------------------------
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 60, // seconds
    });

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
    });
  } catch (err: any) {
    console.error("🟥 [R2] Upload init error:", err?.message || err);

    return NextResponse.json(
      { error: "Upload initialization failed" },
      { status: 500 }
    );
  }
}
