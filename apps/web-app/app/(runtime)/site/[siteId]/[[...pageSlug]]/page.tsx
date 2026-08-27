import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { AnalyticsTracker } from "@/modules/analytics/AnalyticsTracker";
import { renderPublishedSitePage } from "@/modules/runtime/renderPublishedSitePage";
import { PoweredByBuildez } from "@/modules/runtime/PoweredByBuildez";
import { shouldShowBuildezBranding } from "@/modules/runtime/publishedBranding";

export const dynamic = "force-dynamic";

export default async function PublishedWebsite({ params }: { params: Promise<{ siteId: string; pageSlug?: string[] }> }) {
  const { siteId, pageSlug = [] } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, status: "PUBLISHED", deletedAt: null },
    select: {
      id: true, slug: true, tenantId: true,
      pages: { where: { status: "PUBLISHED", deletedAt: null, deleted: false }, select: { slug: true, renderMode: true, blueprint: { select: { id: true } } } },
      v12Project: { select: { id: true } },
    },
  });
  if (!site) notFound();
  const requestedSlug = pageSlug.join("/");
  const page = site.pages.find(candidate => candidate.slug === requestedSlug)
    || (!requestedSlug ? site.pages.find(candidate => candidate.slug === "home") || site.pages[0] : undefined);
  if (!page) notFound();

  const showBuildezBranding =
    await shouldShowBuildezBranding({
      siteId: site.id,
      tenantId: site.tenantId,
    });
  if (page.renderMode === "BLUEPRINT") {
    const publishedPage =
      await renderPublishedSitePage(
        site.slug,
        page.slug,
        { siteId: site.id }
      );

    return (
      <>
        {publishedPage}
        {showBuildezBranding && <PoweredByBuildez />}
      </>
    );
  }
  if (page.renderMode !== "REACT" || !site.v12Project) notFound();
  const iframePath = `/api/runtime/v12/${encodeURIComponent(site.id)}/${page.slug === "home" ? "" : page.slug.split("/").map(encodeURIComponent).join("/")}`;
  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      <AnalyticsTracker siteId={site.id} />

      <iframe
        title="Published website"
        src={iframePath}
        className="h-full w-full border-0"
      />

      {showBuildezBranding && <PoweredByBuildez />}
    </main>
  );
}
