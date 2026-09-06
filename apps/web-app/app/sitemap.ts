import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@buildez/db";
import { resolveTenantSiteByHost } from "@/lib/runtime/resolveTenantSiteByHost";
import { isPlatformHost } from "@/lib/runtime/isPlatformHost";

export const dynamic = "force-dynamic";

// Static marketing routes on the platform's own domain — not tenant pages,
// so they don't live in Prisma and aren't covered by the tenant-page query
// below.
const PLATFORM_MARKETING_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/pricing", priority: 0.9 },
  { path: "/blog", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/changelog", priority: 0.5 },
  { path: "/affiliates", priority: 0.5 },
  { path: "/support", priority: 0.5 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/dpa", priority: 0.3 },
  { path: "/cookies", priority: 0.3 },
  { path: "/refunds", priority: 0.3 },
  { path: "/report-abuse", priority: 0.2 },
  { path: "/report-bugs", priority: 0.2 },
];

const HOMEPAGE_LAST_MODIFIED = new Date("2026-09-06T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const protocol = headerList.get("x-forwarded-proto") || "https";

  if (isPlatformHost(host)) {
    const origin = `${protocol}://${host}`;
    return PLATFORM_MARKETING_ROUTES.map(({ path, priority }) => ({
      url: path === "/" ? origin : `${origin}${path}`,
      ...(path === "/" ? { lastModified: HOMEPAGE_LAST_MODIFIED } : {}),
      changeFrequency: "weekly",
      priority,
    }));
  }

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
