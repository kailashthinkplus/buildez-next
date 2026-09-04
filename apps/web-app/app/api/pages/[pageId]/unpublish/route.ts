// ============================================================================
// PAGE UNPUBLISH ROUTE — V1
// ============================================================================

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { invalidateRouteCache } from "@/lib/runtime/routeCache";

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
      source: "publish",
      query: { pageId },

      userId: auth.user.id,
      tenantId: auth.tenant.id,
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
        deletedAt: null,
        deleted: false,
        site: { tenantId: execCtx.tenantId, deletedAt: null },
      },
      include: {
        site: { select: { slug: true } },
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
    const updated = await prisma.page.updateMany({
      where: { id: page.id, siteId: execCtx.siteId, deletedAt: null, deleted: false },
      data: {
        status: "DRAFT",
      },
    });

    console.log("✅ [UNPUBLISH] COMPLETE");

    if (updated.count !== 1) {
      return NextResponse.json({ error: "Page no longer belongs to this workspace" }, { status: 409 });
    }

    revalidatePath(publishedSitePath(page.site.slug, page.slug));
    revalidatePath(publishedSitePath(page.site.slug));
    invalidateRouteCache(page.site.slug);

    return { success: true };
  }, { requireTenant: true })(req);
}
