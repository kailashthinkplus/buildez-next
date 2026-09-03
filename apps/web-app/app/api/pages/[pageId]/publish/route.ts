// ============================================================================
// PAGE PUBLISH ROUTE — V5 (EXECUTION CONTEXT AWARE — FINAL FIX)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { publishPageNow } from "@/lib/publishing/publishPage";
import { buildAfterPublish } from "@/lib/publishing/buildAfterPublish";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ pageId: string }> }
) {
  return apiHandler(async ({ auth }) => {
    console.log("🚀 [PUBLISH] START");

    const { pageId } = await ctx.params;

    /* ----------------------------------------------------------
       🔒 NORMALIZE AUTH (CRITICAL FIX)
    ---------------------------------------------------------- */
    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "publish",
      query: { pageId },

      // ✅ PASS WHAT resolveExecutionContext EXPECTS
      userId: auth.user.id,
      tenantId: auth.tenant.id,
    });

    console.log("🔐 [PUBLISH] Context resolved", {
      tenantId: execCtx.tenantId,
      siteId: execCtx.siteId,
      pageId: execCtx.pageId,
    });

    /* ----------------------------------------------------------
       VERIFY OWNERSHIP, THEN DELEGATE TO THE SHARED PUBLISH LOGIC
       (also used by the scheduled-publish scanner in lib/publishing/publishPage.ts)
    ---------------------------------------------------------- */
    const page = await prisma.page.findFirst({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
        deletedAt: null,
        deleted: false,
        site: { tenantId: execCtx.tenantId, deletedAt: null },
      },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Invalid page" },
        { status: 400 }
      );
    }

    try {
      const result = await publishPageNow(page.id);
      if (result.isV12) await buildAfterPublish(result.siteId, result.tenantId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "This page could not be published.";
      const status = message === "Page has no publishable source" ? 400 : 409;
      return NextResponse.json({ error: message }, { status });
    }

    console.log("✅ [PUBLISH] COMPLETE");

    return { success: true };
  }, { requireTenant: true })(req);
}
