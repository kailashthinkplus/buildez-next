import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";
import Storefront from "../../../store/Storefront";
import { renderPublishedSitePage } from "@/modules/runtime/renderPublishedSitePage";
import { metadataForSite } from "@/lib/site-metadata";
import { customDomainEntitlement } from "@/lib/domains/entitlements";
import { cachedOrStale } from "@/lib/runtime/routeCache";

export const dynamic = "force-dynamic";

const ROUTE_CACHE_TTL_MS = 30_000;

function resolveDomainConnection(domain: string) {
  return cachedOrStale(`domain:${domain}`, ROUTE_CACHE_TTL_MS, () => prisma.siteDomain.findFirst({
    where: { domain: domain.toLowerCase(), status: "VERIFIED", site: { status: "PUBLISHED", deletedAt: null } },
    include: { site: true },
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path = [] } = await params;
  const connection = await resolveDomainConnection(domain);
  return connection && (await customDomainEntitlement(connection.tenantId)).allowed ? metadataForSite(connection.site.slug, path.join("/") || "home") : {};
}

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path = [] } = await params;
  const connection = await resolveDomainConnection(domain);
  if (!connection) notFound();
  if (!(await customDomainEntitlement(connection.tenantId)).allowed) notFound();

  // Commerce is one channel on the same BuildEZ domain, not the owner of it.
  if (path[0] === "shop") {
    return (
      <Storefront
        lookup={{ domain: connection.domain, path: path.slice(1) }}
        basePath="/shop"
        siteHomeHref="/"
      />
    );
  }

  return renderPublishedSitePage(connection.site.slug, path.join("/") || undefined, { siteId: connection.site.id });
}
