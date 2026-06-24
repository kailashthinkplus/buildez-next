import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ============================================================
   R2 CLIENT — ENV ALIGNED (CRITICAL FIX)
============================================================ */

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // ✅ FIXED
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,     // ✅ FIXED
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, // ✅ FIXED
  },
});

/* ============================================================
   CONSTANTS (FAIL FAST)
============================================================ */

const R2_BUCKET = process.env.R2_BUCKET!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

if (!R2_BUCKET) {
  throw new Error("R2_BUCKET env not set");
}

if (!R2_PUBLIC_URL) {
  throw new Error("R2_PUBLIC_URL env not set");
}

/* ============================================================
   DIRECT UPLOAD (SERVER USE)
============================================================ */

export async function uploadToR2(
  buffer: Buffer,
  path: string,
  mimeType: string
) {
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,        // ✅ FIXED
    Key: path,
    Body: buffer,
    ContentType: mimeType,
  });

  await r2.send(cmd);
}

/* ============================================================
   PRESIGNED UPLOAD (CLIENT USE)
============================================================ */

export async function getR2PresignedUploadUrl(
  path: string,
  mimeType: string,
  expiresIn = 60
) {
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,        // ✅ FIXED
    Key: path,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(r2, cmd, {
    expiresIn,
  });

  const publicUrl = `${R2_PUBLIC_URL}/${path}`;

  return {
    uploadUrl,
    publicUrl,
  };
}
