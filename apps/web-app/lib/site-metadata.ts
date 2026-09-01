import type { Metadata } from "next";
import { prisma } from "@buildez/db";

type Settings = Record<string, unknown>;

export const BUILDEZ_FAVICON_URL = "/favicon.png";

export function buildSiteMetadata(input: {
  siteName: string;
  pageTitle?: string;
  pageSlug: string;
  settings: Settings;
  pageMetadata: Settings;
}): Metadata {
  const { settings, pageMetadata, pageSlug } = input;
  const title = String(
    pageMetadata.seoTitle ||
      settings.seoTitle ||
      input.pageTitle ||
      input.siteName,
  );
  const description = String(
    pageMetadata.seoDescription || settings.seoDescription || "",
  );
  const canonical = String(settings.canonicalUrl || "");
  const socialImage = String(
    pageMetadata.socialImageUrl || settings.socialImageUrl || "",
  );
  const favicon = String(
    pageMetadata.faviconUrl ||
      settings.faviconUrl ||
      BUILDEZ_FAVICON_URL,
  );

  return {
    title,
    description,
    keywords: String(settings.seoKeywords || "")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    robots:
      settings.allowIndexing === false
        ? { index: false, follow: false }
        : { index: true, follow: true },
    alternates: canonical
      ? {
          canonical:
            pageSlug === "home"
              ? canonical
              : `${canonical.replace(/\/$/, "")}/${pageSlug}`,
        }
      : undefined,
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
      creator: String(settings.twitterHandle || "") || undefined,
    },
  };
}

export async function metadataForSite(
  siteSlug: string,
  pageSlug = "home",
): Promise<Metadata> {
  const candidates = await prisma.site.findMany({
    where: { slug: siteSlug, status: "PUBLISHED", deletedAt: null },
    include: {
      pages: {
        where: {
          slug: pageSlug,
          status: "PUBLISHED",
          deletedAt: null,
          deleted: false,
        },
        take: 1,
      },
    },
    take: 2,
  });
  const site = candidates.length === 1 ? candidates[0] : null;
  if (!site) return {};

  const page = site.pages[0];
  return buildSiteMetadata({
    siteName: site.name,
    pageTitle: page?.title,
    pageSlug,
    settings: (site.settings || {}) as Settings,
    pageMetadata: (page?.metadata || {}) as Settings,
  });
}
