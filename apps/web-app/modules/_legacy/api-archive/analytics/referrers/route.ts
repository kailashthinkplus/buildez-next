import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { parseTimeRange } from "@/lib/analytics/time";
import { requireTenantContext } from "@/lib/analytics/auth";

export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext();
    const { since } = parseTimeRange(new URL(req.url).searchParams);

    const refs = await db.trafficEvent.groupBy({
      by: ["referrer"],
      where: {
        tenantId,
        createdAt: { gte: since },
        referrer: { not: null },
      },
      _count: {
        path: true,
        visitorHash: true,
      },
      orderBy: {
        _count: { path: "desc" },
      },
      take: 20,
    });

    return NextResponse.json(
      refs.map((r) => ({
        referrer: r.referrer,
        pageViews: r._count.path,
        visitors: r._count.visitorHash,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
