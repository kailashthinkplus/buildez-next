import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { renderPublishedSitePage } from "@/modules/runtime/renderPublishedSitePage";

export const dynamic = "force-dynamic";

export default async function PublishedSitePreview({
  params,
}: {
  params: Promise<{ siteId: string; pageSlug?: string[] }>;
}) {
  const { siteId, pageSlug } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!site) notFound();
  return renderPublishedSitePage(site.slug, pageSlug?.[0], {
    siteId: site.id,
    preview: true,
  });
}
