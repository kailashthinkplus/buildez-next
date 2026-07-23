import { notFound, redirect } from "next/navigation";
import { prisma } from "@buildez/db";

import { getSession } from "@/lib/auth/getSession";
import Builder3Canvas from "./Builder3Canvas";

export default async function Builder3Page({ params, searchParams }: { params: Promise<{ siteId: string }>; searchParams: Promise<{ pageId?: string }> }) {
  const auth = await getSession();
  if (!auth?.user) redirect("/app/login");
  if (!auth.tenant) redirect("/app/onboarding");
  const { siteId } = await params;
  const { pageId } = await searchParams;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null }, select: { id: true, name: true } });
  if (!site) notFound();
  const page = await prisma.page.findFirst({
    where: { siteId: site.id, deletedAt: null, ...(pageId ? { id: pageId } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, slug: true, status: true, metadata: true },
  });
  const metadata = page?.metadata && typeof page.metadata === "object" && !Array.isArray(page.metadata) ? page.metadata as Record<string, unknown> : {};
  return <Builder3Canvas siteId={site.id} siteName={site.name} page={page ? {
    id: page.id, title: page.title, slug: page.slug, status: page.status,
    seoTitle: String(metadata.seoTitle ?? ""), seoDescription: String(metadata.seoDescription ?? ""),
    faviconUrl: String(metadata.faviconUrl ?? ""),
  } : undefined} />;
}
