import { NextResponse } from "next/server";
import sharp from "sharp";
import { createHash, randomUUID } from "node:crypto";

import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { uploadToR2 } from "@/lib/storage/uploadToR2";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const siteId = String(formData.get("siteId") || "").trim();
    const file = formData.get("file") as File | null;

    if (!siteId || !file) {
      return NextResponse.json(
        { ok: false, error: "siteId and file are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported image type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File exceeds max size (20MB)" },
        { status: 400 }
      );
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());

    const processed = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 2560,
        height: 2560,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 5,
      })
      .toBuffer({ resolveWithObject: true });

    const thumb = await sharp(processed.data)
      .resize({
        width: 640,
        height: 640,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();

    const fileHash = createHash("sha256").update(processed.data).digest("hex");

    const existing = await prisma.mediaAsset.findUnique({
      where: { fileHash },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        asset: existing,
        duplicate: true,
      });
    }

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
    const keyBase = `sites/${siteId}/media/${Date.now()}-${randomUUID()}-${baseName}`;
    const key = `${keyBase}.webp`;
    const thumbKey = `${keyBase}-thumb.webp`;

    const [url, thumbnailUrl] = await Promise.all([
      uploadToR2({
        buffer: processed.data,
        key,
        contentType: "image/webp",
      }),
      uploadToR2({
        buffer: thumb,
        key: thumbKey,
        contentType: "image/webp",
      }),
    ]);

    const asset = await prisma.mediaAsset.create({
      data: {
        siteId,
        uploadedById: user.id,
        url,
        thumbnailUrl,
        filename: `${baseName}.webp`,
        fileHash,
        fileSize: processed.data.length,
        mimeType: "image/webp",
        mediaType: "IMAGE",
        width: processed.info.width,
        height: processed.info.height,
        source: "UPLOAD",
        provider: "r2",
        aspectRatio:
          processed.info.width && processed.info.height
            ? `${processed.info.width}:${processed.info.height}`
            : null,
        tags: [],
      },
    });

    return NextResponse.json({ ok: true, asset });
  } catch (err: any) {
    console.error("[builder-v2/assets/upload] error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
