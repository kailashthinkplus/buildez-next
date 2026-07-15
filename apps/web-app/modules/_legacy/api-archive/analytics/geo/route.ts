import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { parseTimeRange } from "@/lib/analytics/time";
import { requireTenantContext } from "@/lib/analytics/auth";

export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext();
    const { since } = parseTimeRange(new URL(req.url).searchParams);

    const geo = await db.trafficEvent.groupBy({
      by: ["country"],
      where: {
        tenantId,
        createdAt: { gte: since },
      },
      _count: {
        visitorHash: true,
        path: true,
      },
      orderBy: {
        _count: { visitorHash: "desc" },
      },
    });

    return NextResponse.json(
      geo.map((g) => ({
        country: g.country || "Unknown",
        visitors: g._count.visitorHash,
        pageViews: g._count.path,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
