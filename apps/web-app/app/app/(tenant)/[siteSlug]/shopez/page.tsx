import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import ShopezDashboard from "./ShopezDashboard";

export default async function Page({ params }: { params: Promise<{ siteSlug: string }> }) {
  const { siteSlug } = await params; const auth = await getUser(); if (!auth?.tenant?.id) notFound();
  const site = await prisma.site.findFirst({ where: { slug: siteSlug, tenantId: auth.tenant.id, deletedAt: null }, select: { id: true, slug: true, name: true } }); if (!site) notFound();
  return <ShopezDashboard site={site} />;
}
