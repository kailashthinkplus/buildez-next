import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";
import Storefront from "../../../store/Storefront";
import { renderPublishedSitePage } from "@/modules/runtime/renderPublishedSitePage";
import { metadataForSite } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path = [] } = await params;
  const connection = await prisma.siteDomain.findFirst({ where: { domain: domain.toLowerCase(), status: "VERIFIED", site: { status: "PUBLISHED", deletedAt: null } }, include: { site: true } });
  return connection ? metadataForSite(connection.site.slug, path[0] || "home") : {};
}

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path = [] } = await params;
  const connection = await prisma.siteDomain.findFirst({
    where: { domain: domain.toLowerCase(), status: "VERIFIED", site: { status: "PUBLISHED", deletedAt: null } },
    include: { site: true },
  });
  if (!connection) notFound();

  // Commerce is one channel on the same BuildEZ domain, not the owner of it.
  if (path[0] === "shop") return <Storefront lookup={{ domain: connection.domain }} />;

  return renderPublishedSitePage(connection.site.slug, path[0], { siteId: connection.site.id });
}
