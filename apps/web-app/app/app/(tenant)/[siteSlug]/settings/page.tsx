import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import SiteSettings from "./SiteSettings";

export default async function Page({ params }: { params: Promise<{ siteSlug: string }> }) {
  const { siteSlug } = await params; const auth = await getUser(); if (!auth?.tenant?.id) notFound();
  const site = await prisma.site.findFirst({ where: { slug: siteSlug, tenantId: auth.tenant.id, deletedAt: null }, select: { id: true, name: true, slug: true, status: true } });
  if (!site) notFound(); return <SiteSettings site={site} />;
}
