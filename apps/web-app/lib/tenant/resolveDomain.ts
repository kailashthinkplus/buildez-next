// /apps/web-app/lib/tenant/resolveDomain.ts

import { prisma } from "@buildez/db";

export interface DomainContext {
  tenantId: string;
  siteId: string;
  site: any;
  tenant: any;
  isCustomDomain: boolean;
  isPreviewDomain: boolean;
}

/* ============================================================
   RESOLVE DOMAIN → TENANT → SITE
   Works for:
   - Custom domains
   - build ez subdomains
   - preview domains
============================================================ */
export async function resolveDomain(host: string): Promise<DomainContext | null> {
  const cleanHost = host.toLowerCase().trim();

  /* ------------------------------------------------------------
     1. PREVIEW DOMAINS
        preview-abc123.buildez.app
  ------------------------------------------------------------ */
  if (cleanHost.startsWith("preview-")) {
    return {
      tenantId: "",
      siteId: "",
      site: null,
      tenant: null,
      isPreviewDomain: true,
      isCustomDomain: false,
    };
  }

  /* ------------------------------------------------------------
     2. CUSTOM DOMAIN LOOKUP (verified or pending)
  ------------------------------------------------------------ */
  const custom = await prisma.siteDomain.findUnique({
    where: { domain: cleanHost },
    include: {
      site: true,
      tenant: true,
    },
  });

  if (custom) {
    return {
      tenantId: custom.tenantId,
      siteId: custom.siteId,
      site: custom.site,
      tenant: custom.tenant,
      isCustomDomain: true,
      isPreviewDomain: false,
    };
  }

  /* ------------------------------------------------------------
     3. BUILDEZ PLATFORM SUBDOMAIN
        <slug>.buildez.app
        Example: acme.buildez.app
  ------------------------------------------------------------ */

  const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "buildez.app";

  if (cleanHost.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = cleanHost.replace(`.${PLATFORM_DOMAIN}`, "");

    // 3a. Try site slug
    const site = await prisma.site.findFirst({
      where: { slug: subdomain },
      include: { tenant: true },
    });

    if (site) {
      return {
        tenantId: site.tenantId,
        siteId: site.id,
        site,
        tenant: site.tenant,
        isCustomDomain: false,
        isPreviewDomain: false,
      };
    }

    // 3b. Try tenant slug → default site?
    const tenant = await prisma.tenant.findFirst({
      where: { domain: subdomain },
    });

    if (tenant) {
      const defaultSite = await prisma.site.findFirst({
        where: { tenantId: tenant.id },
      });

      if (defaultSite) {
        return {
          tenantId: tenant.id,
          siteId: defaultSite.id,
          site: defaultSite,
          tenant,
          isCustomDomain: false,
          isPreviewDomain: false,
        };
      }
    }
  }

  /* ------------------------------------------------------------
     4. NOT FOUND
  ------------------------------------------------------------ */
  return null;
}
