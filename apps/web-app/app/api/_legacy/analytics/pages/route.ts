import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { parseTimeRange } from "@/lib/analytics/time";
import { requireTenantContext } from "@/lib/analytics/auth";

export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext();
    const { since } = parseTimeRange(new URL(req.url).searchParams);

    const events = await db.trafficEvent.groupBy({
      by: ["path"],
      where: {
        tenantId,
        createdAt: { gte: since },
        device: { not: "bot" },
      },
      _count: {
        path: true,
        visitorHash: true,
      },
      orderBy: {
        _count: { path: "desc" },
      },
      take: 50,
    });

    return NextResponse.json(
      events.map((e) => ({
        path: e.path,
        pageViews: e._count.path,
        visitors: e._count.visitorHash,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
