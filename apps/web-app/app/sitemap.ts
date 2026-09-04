import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@buildez/db";
import { resolveTenantSiteByHost } from "@/lib/runtime/resolveTenantSiteByHost";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const protocol = headerList.get("x-forwarded-proto") || "https";
  const site = await resolveTenantSiteByHost(host);
  if (!site || site.settings.allowIndexing === false) return [];

  const origin = `${protocol}://${host}`;
  const pages = await prisma.page.findMany({
    where: { siteId: site.id, status: "PUBLISHED", deletedAt: null, deleted: false },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { slug: "asc" },
  });

  return pages.map((page) => ({
    url: page.slug === "home" ? origin : `${origin}/${page.slug}`,
    lastModified: page.updatedAt ?? page.publishedAt ?? undefined,
    changeFrequency: "weekly",
    priority: page.slug === "home" ? 1 : 0.7,
  }));
}
