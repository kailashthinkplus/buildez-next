import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { parseTimeRange } from "@/lib/analytics/time";
import { requireTenantContext } from "@/lib/analytics/auth";

export async function GET(req: Request) {
  try {
    const { tenantId } = await requireTenantContext();
    const { since } = parseTimeRange(new URL(req.url).searchParams);

    const rows = await db.trafficRollupHourly.findMany({
      where: {
        siteId: {
          in: (
            await db.site.findMany({
              where: { tenantId },
              select: { id: true },
            })
          ).map((s) => s.id),
        },
        hour: { gte: since },
      },
      orderBy: { hour: "asc" },
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.pageViews += r.pageViews;
        acc.visitors += r.visitors;
        acc.bots += r.bots;
        return acc;
      },
      { pageViews: 0, visitors: 0, bots: 0 }
    );

    return NextResponse.json({
      totals,
      trend: rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
