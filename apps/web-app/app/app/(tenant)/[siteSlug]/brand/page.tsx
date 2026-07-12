import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";
import { getAuthContext } from "@/lib/auth/getAuthContext";
import BrandIntelligenceSettings from "@/modules/builder-v2/brand/BrandIntelligenceSettings";

export default async function BrandIntelligencePage({ params }: { params: Promise<{ siteSlug: string }> }) {
  const auth = await getAuthContext();
  if (!auth?.tenantId) notFound();
  const { siteSlug } = await params;
  const site = await prisma.site.findFirst({ where: { slug: siteSlug, tenantId: auth.tenantId }, select: { id: true, name: true } });
  if (!site) notFound();
  return <div className="h-full overflow-y-auto px-6 py-10">
    <div className="mx-auto mb-8 max-w-3xl"><h1 className="text-2xl font-semibold">Brand Intelligence</h1><p className="mt-2 text-sm dashboard-muted">Manage the identity used by {site.name}, AI generation, and every global website surface.</p></div>
    <BrandIntelligenceSettings siteId={site.id} />
  </div>;
}
