import crypto from "node:crypto";
import { prisma } from "@buildez/db";

const RESERVED_PUBLIC_SLUGS = new Set([
  "api",
  "app",
  "assets",
  "domain-runtime",
  "favicon",
  "preview",
  "published-preview",
  "robots",
  "site",
  "sitemap",
  "super",
  "www",
]);

export function normalizePublicSiteSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function isReservedPublicSiteSlug(slug: string) {
  return RESERVED_PUBLIC_SLUGS.has(slug);
}

export async function nextAvailablePublicSiteSlug(value: string) {
  const normalized = normalizePublicSiteSlug(value) || "website";
  const base = isReservedPublicSiteSlug(normalized) ? `${normalized}-site` : normalized;

  for (let suffix = 1; suffix <= 999; suffix += 1) {
    const ending = suffix === 1 ? "" : `-${suffix}`;
    const candidate = `${base.slice(0, 80 - ending.length)}${ending}`;
    const exists = await prisma.site.findFirst({
      where: { slug: candidate, deletedAt: null },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return `${base.slice(0, 67)}-${crypto.randomUUID().slice(0, 12)}`;
}
