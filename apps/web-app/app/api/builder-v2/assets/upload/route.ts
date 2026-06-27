import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createHash, randomUUID } from "node:crypto";

import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { slugify } from "@/lib/utils/slugify";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function folderSegment(label: string | null | undefined, fallback: string) {
  return slugify(label || fallback) || slugify(fallback) || "untitled";
}

function idTail(id: string) {
  return id.slice(-8);
}

export async function POST(req: NextRequest) {
  const uploadRequestId = randomUUID();

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      console.error("[builder-v2/assets/upload] unauthorized", {
        uploadRequestId,
      });
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await verifyTenantAccess(req);
    if (!tenant) {
      const tenantHeader = req.headers.get("x-tenant-id");
      const tenantCookie = req.cookies.get("tenant-id")?.value;
      console.error("[builder-v2/assets/upload] tenant-unauthorized", {
        uploadRequestId,
        userId: user.id,
        tenantHeader,
        tenantCookie,
      });
      return NextResponse.json(
        { ok: false, error: "Unauthorized tenant access" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const siteId = String(formData.get("siteId") || "").trim();
    const file = formData.get("file") as File | null;

    if (!siteId || !file) {
      console.error("[builder-v2/assets/upload] missing-input", {
        uploadRequestId,
        siteId,
        hasFile: Boolean(file),
      });
      return NextResponse.json(
        { ok: false, error: "siteId and file are required" },
        { status: 400 }
      );
    }

    /* Validate site exists within authenticated tenant */
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        tenantId: tenant.id,
      },
      select: { id: true, tenantId: true, name: true, slug: true },
    });

    if (!site) {
      console.error("[builder-v2/assets/upload] site-not-found", {
        uploadRequestId,
        siteId,
        tenantId: tenant.id,
      });
      return NextResponse.json(
        { ok: false, error: "Site not found for this tenant" },
        { status: 404 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      console.error("[builder-v2/assets/upload] unsupported-type", {
        uploadRequestId,
        fileType: file.type,
      });
      return NextResponse.json(
        { ok: false, error: "Unsupported image type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      console.error("[builder-v2/assets/upload] file-too-large", {
        uploadRequestId,
        fileSize: file.size,
        maxSize: MAX_UPLOAD_BYTES,
      });
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

    const fileHash = createHash("sha256")
      .update(siteId)
      .update(":")
      .update(processed.data)
      .digest("hex");

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

    const storeSegment = `${folderSegment(tenant.name, tenant.id)}-${idTail(tenant.id)}`;
    const websiteSegment = `${folderSegment(site.slug || site.name, site.id)}-${idTail(site.id)}`;
    const userSegment = `${folderSegment(user.name || user.email, user.id)}-${idTail(user.id)}`;
    const folder = `stores/${storeSegment}/websites/${websiteSegment}/users/${userSegment}/media`;
    const baseName =
      folderSegment(file.name.replace(/\.[^.]+$/, ""), "upload") || "upload";
    const keyBase = `${folder}/${Date.now()}-${randomUUID()}-${baseName}`;
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
        folder,
        metadata: {
          storeId: tenant.id,
          storeName: tenant.name,
          websiteId: site.id,
          websiteSlug: site.slug,
          websiteName: site.name,
          uploadedById: user.id,
          uploadedByName: user.name,
          uploadedByEmail: user.email,
          r2Key: key,
          r2ThumbnailKey: thumbKey,
          originalFilename: file.name,
        },
        aspectRatio:
          processed.info.width && processed.info.height
            ? `${processed.info.width}:${processed.info.height}`
            : null,
        tags: [],
      },
    });

    return NextResponse.json({ ok: true, asset });
  } catch (err: any) {
    console.error("[builder-v2/assets/upload] error", {
      uploadRequestId,
      message: err?.message,
      stack: err?.stack,
      err,
    });
    return NextResponse.json(
      { ok: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
