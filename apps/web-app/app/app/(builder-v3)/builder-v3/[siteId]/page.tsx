import { notFound, redirect } from "next/navigation";
import { prisma } from "@buildez/db";

import { getSession } from "@/lib/auth/getSession";
import Builder3Canvas from "./Builder3Canvas";

export default async function Builder3Page({ params }: { params: Promise<{ siteId: string }> }) {
  const auth = await getSession();
  if (!auth?.user) redirect("/app/login");
  if (!auth.tenant) redirect("/app/onboarding");
  const { siteId } = await params;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null }, select: { id: true, name: true } });
  if (!site) notFound();
  return <Builder3Canvas siteId={site.id} siteName={site.name} />;
}
