import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveTenantSiteByHost } from "@/lib/runtime/resolveTenantSiteByHost";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const protocol = headerList.get("x-forwarded-proto") || "https";
  const site = await resolveTenantSiteByHost(host);

  // No resolved tenant site — the platform's own dashboard/auth host, or an
  // unrecognized/unverified domain. Never index it.
  if (!site) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const origin = `${protocol}://${host}`;
  const allowIndexing = site.settings.allowIndexing !== false;

  return {
    rules: { userAgent: "*", ...(allowIndexing ? { allow: "/" } : { disallow: "/" }) },
    sitemap: `${origin}/sitemap.xml`,
  };
}
