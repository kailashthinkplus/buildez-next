// /apps/web-app/app/api/ai/usage/route.ts

// ============================================================================
// AI USAGE API — AUTHORITATIVE
// TENANT-SCOPED AI TOKEN + GENERATION METRICS
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

/* 🔒 AUTH */
import { getAuthContext } from "@/lib/auth/getAuthContext";

/* 🗄️ DB */
import { prisma } from "@buildez/db";

/* ----------------------------------------------------------------------------
   GET
   /api/ai/usage
   /api/ai/usage?siteId=...
   /api/ai/usage?pageId=...
---------------------------------------------------------------------------- */
export async function GET(req: NextRequest) {
  console.log("[AI USAGE] → start");

  try {
    /* ----------------------------------------------------------
       AUTH
    ---------------------------------------------------------- */
    const auth = await getAuthContext();

    if (!auth?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");
    const pageId = searchParams.get("pageId");

    /* ----------------------------------------------------------
       FILTER
    ---------------------------------------------------------- */
    const where: any = {
      tenantId: auth.tenantId,
      status: "success",
    };

    if (siteId) where.siteId = siteId;
    if (pageId) where.pageId = pageId;

    /* ----------------------------------------------------------
       AGGREGATE
    ---------------------------------------------------------- */
    const aggregates = await prisma.aiEvent.aggregate({
      where,
      _sum: {
        tokensIn: true,
        tokensOut: true,
      },
      _count: {
        id: true,
      },
    });

    const totalTokensIn = aggregates._sum.tokensIn ?? 0;
    const totalTokensOut = aggregates._sum.tokensOut ?? 0;
    const generations = aggregates._count.id ?? 0;

    /* ----------------------------------------------------------
       RESPONSE
    ---------------------------------------------------------- */
    return NextResponse.json({
      tenantId: auth.tenantId,
      scope: {
        siteId,
        pageId,
      },
      usage: {
        generations,
        tokensIn: totalTokensIn,
        tokensOut: totalTokensOut,
        totalTokens: totalTokensIn + totalTokensOut,
      },
    });
  } catch (err: any) {
    console.error("[AI USAGE] 💥 fatal", err);

    return NextResponse.json(
      { error: err?.message ?? "Failed to load AI usage" },
      { status: 500 }
    );
  }
}
