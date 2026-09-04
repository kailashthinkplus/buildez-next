import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";

export async function GET() {
  const auth = await getUser();
  if (!auth?.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const since = new Date(Date.now() - 30 * 86400000);
  const [sites, events, aiGenerations] = await Promise.all([
    prisma.site.findMany({
      where: { tenantId: auth.tenant.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        updatedAt: true,
        archivedAt: true,
        domains: { where: { status: "VERIFIED" }, select: { domain: true }, take: 1 },
      },
    }),
    prisma.trafficEvent.findMany({
      where: {
        tenantId: auth.tenant.id,
        eventType: "pageview",
        device: { not: "bot" },
        createdAt: { gte: since },
      },
      select: { siteId: true, visitorHash: true },
    }),
    prisma.aiEvent.count({
      where: { tenantId: auth.tenant.id, createdAt: { gte: since }, status: { in: ["SUCCESS", "COMPLETED", "success", "completed"] } },
    }),
  ]);

  const visitors = new Set(events.map((x) => x.visitorHash));
  const bySite = new Map<string, { views: number; visitors: Set<string> }>();
  events.forEach((x) => {
    const v = bySite.get(x.siteId) || { views: 0, visitors: new Set<string>() };
    v.views++;
    v.visitors.add(x.visitorHash);
    bySite.set(x.siteId, v);
  });

  const activeSites = sites.filter((site) => !site.archivedAt);

  return NextResponse.json({
    rangeDays: 30,
    totals: {
      sites: activeSites.length,
      publishedSites: activeSites.filter((x) => x.status === "PUBLISHED").length,
      pageViews: events.length,
      visitors: visitors.size,
      aiGenerations,
    },
    sites: sites.map(({ domains, ...x }) => ({
      ...x,
      archived: Boolean(x.archivedAt),
      pageViews: bySite.get(x.id)?.views || 0,
      visitors: bySite.get(x.id)?.visitors.size || 0,
      verifiedDomain: domains[0]?.domain ?? null,
    })),
  });
}
