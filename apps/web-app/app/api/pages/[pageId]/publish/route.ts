// ============================================================================
// PAGE PUBLISH ROUTE — V5 (EXECUTION CONTEXT AWARE — FINAL FIX)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

import { resolveBlueprintTree } from "@/modules/builder/runtime/resolveBlueprintTree";
import { isBuilderV2Blueprint } from "@/modules/builder-v2/runtime/isBuilderV2Blueprint";

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
      role: auth.role,
      permissions: auth.permissions,
      isSuperAdmin: auth.isSuperAdmin,
      isTenantAdmin: auth.isTenantAdmin,
      isEditor: auth.isEditor,
    });

    console.log("🔐 [PUBLISH] Context resolved", {
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
      include: {
        blueprint: true,
      },
    });

    if (!page?.blueprint?.data) {
      return NextResponse.json(
        { error: "Invalid page or blueprint" },
        { status: 400 }
      );
    }

    const blueprintData = page.blueprint.data;
    const snapshotContent = isBuilderV2Blueprint(blueprintData)
      ? blueprintData
      : resolveBlueprintTree(blueprintData);

    /* ----------------------------------------------------------
       TRANSACTION
    ---------------------------------------------------------- */
    await prisma.$transaction(async (tx) => {
      const lastSnapshot = await tx.siteSnapshot.findFirst({
        where: {
          siteId: execCtx.siteId,
          tenantId: execCtx.tenantId,
        },
        orderBy: { version: "desc" },
      });

      const nextVersion = (lastSnapshot?.version ?? 0) + 1;

      const siteSnapshot = await tx.siteSnapshot.create({
        data: {
          siteId: execCtx.siteId,
          tenantId: execCtx.tenantId,
          status: "PUBLISHED",
          version: nextVersion,
        },
      });

      await tx.pageSnapshot.create({
        data: {
          siteSnapshotId: siteSnapshot.id,
          pageId: page.id,
          title: page.title,
          slug: page.slug,
          content: snapshotContent,
        },
      });

      await tx.page.update({
        where: { id: page.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      await tx.site.update({
        where: { id: execCtx.siteId },
        data: { status: "PUBLISHED" },
      });
    });

    console.log("✅ [PUBLISH] COMPLETE");

    return { success: true };
  })(req);
}
