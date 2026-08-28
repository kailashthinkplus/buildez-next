import { randomUUID } from "node:crypto";

import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { persistGeneratedImage } from "@/modules/builder-v2/media/server/persistGeneratedImage";

const CONTENT_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "model/gltf-binary": "glb",
  "model/gltf+json": "gltf",
  "application/json": "json",
  "application/octet-stream": "bin",
};

export async function persistCreativeAsset(input: {
  sourceUrl: string;
  siteId: string;
  tenantId: string;
  userId: string;
  prompt: string;
  provider: string;
  signal: AbortSignal;
}) {
  const response = await fetch(input.sourceUrl, {
    cache: "no-store",
    signal: AbortSignal.any([input.signal, AbortSignal.timeout(120_000)]),
  });
  if (!response.ok) throw new Error(`Creative asset download failed (${response.status})`);
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "application/octet-stream";

  if (contentType.startsWith("image/")) {
    const asset = await persistGeneratedImage({
      sourceUrl: input.sourceUrl,
      siteId: input.siteId,
      tenantId: input.tenantId,
      userId: input.userId,
      prompt: input.prompt,
      provider: input.provider,
    });
    return asset.url;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const maximum = Number(process.env.BUILDEZ_CREATIVE_ASSET_MAX_BYTES || 250 * 1024 * 1024);
  if (!buffer.length || buffer.length > maximum) throw new Error("Creative asset exceeds the configured size limit");

  const pathExtension = new URL(input.sourceUrl).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase();
  const extension = CONTENT_EXTENSIONS[contentType] || pathExtension || "bin";
  return uploadToR2({
    buffer,
    key: `generated/${input.tenantId}/${input.siteId}/creative/${Date.now()}-${randomUUID()}.${extension}`,
    contentType,
  });
}
