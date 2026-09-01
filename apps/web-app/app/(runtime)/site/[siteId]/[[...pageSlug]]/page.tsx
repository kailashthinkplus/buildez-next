import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@buildez/db";
import { publishedSitePath } from "@/lib/runtime/published-site-path";

export const dynamic = "force-dynamic";

export default async function LegacyPublishedWebsite({ params }: { params: Promise<{ siteId: string; pageSlug?: string[] }> }) {
  const { siteId, pageSlug = [] } = await params;
  const site = await prisma.site.findFirst({ where: { id: siteId, status: "PUBLISHED", deletedAt: null }, select: { slug: true } });
  if (!site) notFound();
  permanentRedirect(publishedSitePath(site.slug, pageSlug.join("/")));
}
