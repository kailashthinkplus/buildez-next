// /app/api/ai/draft-plan/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { resolveExecutionContext } from "@/lib/context/resolveExecutionContext";
import { prisma } from "@buildez/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId required" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       AUTH
    ---------------------------------------------------------- */
    const session = await getSession();
    if (!session?.tenantId || !session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ----------------------------------------------------------
       EXECUTION CONTEXT (PAGE → SITE)
    ---------------------------------------------------------- */
    const ctx = await resolveExecutionContext({
      req,
      scope: "page",
      source: "ai-draft-plan",
      query: { pageId },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    /* ----------------------------------------------------------
       LOAD SITE + DRAFT PLAN
    ---------------------------------------------------------- */
    const site = await prisma.site.findUnique({
      where: { id: ctx.siteId },
      select: {
        slug: true,
        aiDraftPlan: true,
      },
    });

    if (!site?.aiDraftPlan) {
      return NextResponse.json({
        siteType: "single-page",
        pages: [],
      });
    }

    /* ----------------------------------------------------------
       LOAD ALL PAGES (SITE-SCOPED)
    ---------------------------------------------------------- */
    const pages = await prisma.page.findMany({
      where: {
        siteId: ctx.siteId,
        tenantId: ctx.tenantId,
        deletedAt: null,
      },
      include: {
        blueprint: { select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const responsePages = pages.map((p) => ({
      pageId: p.id,
      title: p.title,
      slug: p.slug,
      isHome: p.slug.startsWith("home"),
      hasBlueprint: Boolean(p.blueprint),
      builderUrl: `/app/(builder)/${site.slug}/${p.slug}`,
    }));

    return NextResponse.json({
      siteType: site.aiDraftPlan.siteType,
      pages: responsePages,
    });
  } catch (err: any) {
    console.error("[AI DRAFT PLAN]", err);
    return NextResponse.json(
      { error: "Failed to load draft plan" },
      { status: 500 }
    );
  }
}
