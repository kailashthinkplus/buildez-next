/**
 * True when a request Host header is the platform's own marketing/dashboard
 * domain (e.g. getbuildezy.com), as opposed to a tenant subdomain or a
 * verified custom domain. Mirrors the `host === platformDomain` check inside
 * resolveTenantSiteByHost, so host-level routes (robots.txt, sitemap.xml,
 * llms.txt) can special-case the platform's own homepage instead of falling
 * into the "no tenant site" branch.
 */
export function isPlatformHost(rawHost: string): boolean {
  const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
  const host = rawHost.split(":")[0].toLowerCase();
  return host === platformDomain;
}
