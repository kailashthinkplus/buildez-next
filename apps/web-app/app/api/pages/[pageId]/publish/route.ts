// ============================================================================
// PAGE PUBLISH ROUTE — V5 (EXECUTION CONTEXT AWARE — FINAL FIX)
// ============================================================================

import { NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

/* 🔒 EXECUTION CONTEXT */
import {
  resolveExecutionContext,
  type ExecutionContext,
} from "@/lib/context/resolveExecutionContext";

import { resolveBlueprintTree, type BlueprintData } from "@/modules/builder/runtime/resolveBlueprintTree";
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
        deletedAt: null,
        deleted: false,
        site: { tenantId: execCtx.tenantId, deletedAt: null },
      },
      include: {
        blueprint: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Invalid page" },
        { status: 400 }
      );
    }

    const blueprintData = page.blueprint?.data;
    const project = !blueprintData ? await prisma.v12Project.findUnique({
      where: { siteId: execCtx.siteId },
      include: { files: { select: { path: true, contentHash: true, revision: true }, orderBy: { path: "asc" } } },
    }) : null;
    if (!blueprintData && !project?.files.length) return NextResponse.json({ error: "Page has no publishable source" }, { status: 400 });
    const snapshotContent = blueprintData
      ? (isBuilderV2Blueprint(blueprintData) ? blueprintData : resolveBlueprintTree(blueprintData as unknown as BlueprintData))
      : { version: 12, renderMode: "REACT", projectId: project!.id, revision: project!.currentRevision, files: project!.files };

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
          content: snapshotContent as unknown as Prisma.InputJsonValue,
        },
      });

      const updatedPage = await tx.page.updateMany({
        where: { id: page.id, siteId: execCtx.siteId, deletedAt: null, deleted: false },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      const updatedSite = await tx.site.updateMany({
        where: { id: execCtx.siteId, tenantId: execCtx.tenantId, deletedAt: null },
        data: { status: "PUBLISHED" },
      });
      if (updatedPage.count !== 1 || updatedSite.count !== 1) {
        throw new Error("Publish target no longer belongs to this workspace");
      }
    });

    console.log("✅ [PUBLISH] COMPLETE");

    return { success: true };
  }, { requireTenant: true })(req);
}
