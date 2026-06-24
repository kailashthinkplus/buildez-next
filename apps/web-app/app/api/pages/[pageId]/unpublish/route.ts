// ============================================================================
// PAGE UNPUBLISH ROUTE — V1
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

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
    console.log("🚀 [UNPUBLISH] START");

    const { pageId } = await ctx.params;

    /* ----------------------------------------------------------
       🔒 NORMALIZE AUTH
    ---------------------------------------------------------- */
    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "unpublish",
      query: { pageId },

      userId: auth.user.id,
      tenantId: auth.tenant.id,
      role: auth.role,
      permissions: auth.permissions,
      isSuperAdmin: auth.isSuperAdmin,
      isTenantAdmin: auth.isTenantAdmin,
      isEditor: auth.isEditor,
    });

    console.log("🔐 [UNPUBLISH] Context resolved", {
      tenantId: execCtx.tenantId,
      siteId: execCtx.siteId,
      pageId: execCtx.pageId,
    });

    /* ----------------------------------------------------------
       LOAD PAGE
    ---------------------------------------------------------- */
    const page = await prisma.page.findFirst({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       UNPUBLISH
    ---------------------------------------------------------- */
    const updated = await prisma.page.update({
      where: { id: page.id },
      data: {
        status: "DRAFT",
      },
    });

    console.log("✅ [UNPUBLISH] COMPLETE");

    return { success: true, page: updated };
  })(req);
}
