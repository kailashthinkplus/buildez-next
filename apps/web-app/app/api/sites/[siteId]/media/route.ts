import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { getCurrentUser } from "@/lib/auth/session";
import { createHash } from "node:crypto";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function extension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 5) return fromName;
  return file.type === "image/svg+xml" ? "svg" : file.type.split("/").pop() || "img";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null }, select: { id: true } });
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  const assets = await prisma.mediaAsset.findMany({
    where: { siteId, mediaType: "IMAGE" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, url: true, thumbnailUrl: true, filename: true, alt: true, source: true, createdAt: true },
  });
  return NextResponse.json({ assets });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: tenant.id, deletedAt: null },
    select: { id: true, settings: true },
  });
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const purposeValue = String(form.get("purpose") || "image")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) || "image";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use PNG, JPG, WebP, AVIF, GIF, SVG, or ICO" }, { status: 415 });
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Images must be smaller than 12 MB" }, { status: 413 });
  }

  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const key = `sites/${siteId}/uploads/${purposeValue}/${crypto.randomUUID()}.${extension(file)}`;
  const imageUrl = await uploadToR2({ file, key, contentType: file.type });
  const fileHash = createHash("sha256").update(siteId).update(bytes).digest("hex");
  const asset = await prisma.mediaAsset.upsert({
    where: { fileHash },
    create: {
      url: imageUrl,
      filename: file.name.slice(0, 240) || `${purposeValue}.${extension(file)}`,
      fileHash,
      fileSize: file.size,
      mediaType: "IMAGE",
      mimeType: file.type,
      tags: [purposeValue],
      siteId,
      uploadedById: user.id,
      source: "UPLOAD",
      metadata: { purpose: purposeValue },
    },
    update: { url: imageUrl, filename: file.name.slice(0, 240), fileSize: file.size, mimeType: file.type, updatedAt: new Date() },
    select: { id: true, url: true, filename: true, source: true },
  });
  if (purposeValue === "favicon") {
    await prisma.site.update({
      where: { id: site.id },
      data: {
        settings: {
          ...record(site.settings),
          faviconUrl: imageUrl,
        },
      },
    });
  }
  return NextResponse.json({ imageUrl, asset });
}
