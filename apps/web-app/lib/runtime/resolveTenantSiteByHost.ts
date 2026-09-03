import { prisma } from "@buildez/db";
import { customDomainEntitlement } from "@/lib/domains/entitlements";

const RESERVED_PLATFORM_SUBDOMAINS = new Set(["app", "www", "admin", "api"]);

export type HostResolvedSite = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  settings: Record<string, unknown>;
};

function asSettings(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/**
 * Resolves the published tenant site (if any) that owns a given request
 * Host header — mirrors the tenant-subdomain vs. custom-domain split in
 * middleware.ts and app/domain-runtime/[domain]/[[...path]]/page.tsx, so
 * host-level routes (robots.txt, sitemap.xml, llms.txt) stay consistent
 * with how the same host resolves for actual page requests.
 */
export async function resolveTenantSiteByHost(rawHost: string): Promise<HostResolvedSite | null> {
  const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
  const host = rawHost.split(":")[0].toLowerCase();

  if (!host || host === "localhost" || host.endsWith(".localhost") || host === platformDomain) {
    return null;
  }

  if (host.endsWith(`.${platformDomain}`)) {
    const label = host.slice(0, -(platformDomain.length + 1));
    if (!label || RESERVED_PLATFORM_SUBDOMAINS.has(label)) return null;
    const site = await prisma.site.findFirst({
      where: { slug: label, status: "PUBLISHED", deletedAt: null },
      select: { id: true, tenantId: true, slug: true, name: true, settings: true },
    });
    return site ? { ...site, settings: asSettings(site.settings) } : null;
  }

  const connection = await prisma.siteDomain.findFirst({
    where: { domain: host, status: "VERIFIED", site: { status: "PUBLISHED", deletedAt: null } },
    include: { site: { select: { id: true, tenantId: true, slug: true, name: true, settings: true } } },
  });
  if (!connection) return null;
  if (!(await customDomainEntitlement(connection.tenantId)).allowed) return null;
  return { ...connection.site, settings: asSettings(connection.site.settings) };
}
