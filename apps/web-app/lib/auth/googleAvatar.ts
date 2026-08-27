import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@buildez/db";
import sharp from "sharp";

import { deleteFromR2Url, uploadToR2 } from "@/lib/storage/uploadToR2";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function isAllowedAvatarUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const googleImage = url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com");
    const r2Base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
    return googleImage || Boolean(r2Base && value.startsWith(`${r2Base}/tenants/pending/`));
  } catch {
    return false;
  }
}

async function downloadAvatar(sourceUrl: string) {
  if (!isAllowedAvatarUrl(sourceUrl)) throw new Error("Unsupported Google avatar source");
  const response = await fetch(sourceUrl, { cache: "no-store", redirect: "error" });
  if (!response.ok) throw new Error(`Google avatar download failed (${response.status})`);
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (declaredSize > MAX_AVATAR_BYTES) throw new Error("Google avatar is too large");
  const input = Buffer.from(await response.arrayBuffer());
  if (!input.length || input.length > MAX_AVATAR_BYTES) throw new Error("Google avatar is empty or too large");
  return sharp(input).rotate().resize(512, 512, { fit: "cover", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
}

async function saveAvatar(userId: string, folder: string, sourceUrl: string) {
  const buffer = await downloadAvatar(sourceUrl);
  const digest = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const avatarUrl = await uploadToR2({
    buffer,
    key: `tenants/${folder}/users/${userId}/profile/google-avatar-${digest}.webp`,
    contentType: "image/webp",
  });
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
  return avatarUrl;
}

export async function persistPendingGoogleAvatar(userId: string, sourceUrl: string) {
  return saveAvatar(userId, `pending/${userId}`, sourceUrl);
}

export async function persistGoogleAvatarForTenant(input: {
  userId: string;
  tenantId: string;
  sourceUrl: string;
}) {
  const r2Base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (r2Base && input.sourceUrl.startsWith(`${r2Base}/tenants/${input.tenantId}/`)) {
    return input.sourceUrl;
  }
  const avatarUrl = await saveAvatar(input.userId, input.tenantId, input.sourceUrl);
  if (r2Base && input.sourceUrl.startsWith(`${r2Base}/tenants/pending/`)) {
    await deleteFromR2Url(input.sourceUrl).catch(() => undefined);
  }
  return avatarUrl;
}
