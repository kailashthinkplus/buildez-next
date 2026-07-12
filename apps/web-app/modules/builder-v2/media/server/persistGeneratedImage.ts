import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "@buildez/db";
import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { slugify } from "@/lib/utils/slugify";

function segment(value: string | null | undefined, fallback: string) {
  return slugify(value || fallback) || "untitled";
}

export async function persistGeneratedImage(input: {
  sourceUrl: string;
  siteId: string;
  userId: string;
  tenantId: string;
  prompt: string;
  provider: string;
}) {
  const [site, user, tenant] = await Promise.all([
    prisma.site.findFirst({ where: { id: input.siteId, tenantId: input.tenantId }, select: { id: true, name: true, slug: true } }),
    prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, name: true, email: true } }),
    prisma.tenant.findUnique({ where: { id: input.tenantId }, select: { id: true, name: true } }),
  ]);
  if (!site || !user || !tenant) throw new Error("Site not found for this tenant");

  const source = input.sourceUrl.startsWith("data:")
    ? Buffer.from(input.sourceUrl.split(",")[1] || "", "base64")
    : Buffer.from(await (await fetch(input.sourceUrl)).arrayBuffer());
  const processed = await sharp(source).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true });
  const thumbnail = await sharp(processed.data).resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toBuffer();
  const fileHash = createHash("sha256").update(input.siteId).update(":").update(processed.data).digest("hex");
  const existing = await prisma.mediaAsset.findUnique({ where: { fileHash } });
  if (existing) return existing;

  const folder = `stores/${segment(tenant.name, tenant.id)}-${tenant.id.slice(-8)}/websites/${segment(site.slug || site.name, site.id)}-${site.id.slice(-8)}/users/${segment(user.name || user.email, user.id)}-${user.id.slice(-8)}/media`;
  const base = `${folder}/${Date.now()}-${randomUUID()}-ai-generated`;
  const [url, thumbnailUrl] = await Promise.all([
    uploadToR2({ buffer: processed.data, key: `${base}.webp`, contentType: "image/webp" }),
    uploadToR2({ buffer: thumbnail, key: `${base}-thumb.webp`, contentType: "image/webp" }),
  ]);
  return prisma.mediaAsset.create({ data: {
    siteId: site.id, uploadedById: user.id, url, thumbnailUrl,
    filename: `ai-generated-${Date.now()}.webp`, fileHash, fileSize: processed.data.length,
    mimeType: "image/webp", mediaType: "IMAGE", width: processed.info.width, height: processed.info.height,
    source: "AI", provider: input.provider, prompt: input.prompt, folder, tags: ["AI generated"],
    alt: input.prompt.slice(0, 160), title: "AI generated image",
    aspectRatio: processed.info.width && processed.info.height ? `${processed.info.width}:${processed.info.height}` : null,
    metadata: { tenantId: tenant.id, r2Key: `${base}.webp`, r2ThumbnailKey: `${base}-thumb.webp` },
  }});
}
