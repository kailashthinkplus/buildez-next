import type { Metadata } from "next";
import { prisma } from "@buildez/db";

type Settings = Record<string, unknown>;
export async function metadataForSite(siteSlug: string, pageSlug = "home"): Promise<Metadata> {
  const candidates = await prisma.site.findMany({ where: { slug: siteSlug, status: "PUBLISHED", deletedAt: null }, include: { pages: { where: { slug: pageSlug, status: "PUBLISHED", deletedAt: null }, take: 1 } }, take: 2 });
  const site = candidates.length === 1 ? candidates[0] : null;
  if (!site) return {};
  const settings = (site.settings || {}) as Settings; const page = site.pages[0]; const pageMeta = (page?.metadata || {}) as Settings;
  const title = String(pageMeta.seoTitle || settings.seoTitle || page?.title || site.name);
  const description = String(pageMeta.seoDescription || settings.seoDescription || "");
  const canonical = String(settings.canonicalUrl || ""); const socialImage = String(pageMeta.socialImageUrl || settings.socialImageUrl || ""); const favicon = String(pageMeta.faviconUrl || settings.faviconUrl || "");
  return {
    title, description,
    keywords: String(settings.seoKeywords || "").split(",").map(x => x.trim()).filter(Boolean),
    robots: settings.allowIndexing === false ? { index: false, follow: false } : { index: true, follow: true },
    alternates: canonical ? { canonical: pageSlug === "home" ? canonical : `${canonical.replace(/\/$/, "")}/${pageSlug}` } : undefined,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: { title, description, type: "website", images: socialImage ? [{ url: socialImage }] : undefined },
    twitter: { card: socialImage ? "summary_large_image" : "summary", title, description, images: socialImage ? [socialImage] : undefined, creator: String(settings.twitterHandle || "") || undefined },
  };
}
