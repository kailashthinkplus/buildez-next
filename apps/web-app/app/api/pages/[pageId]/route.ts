// ============================================================================
// PAGE ROUTE — V5 (NEXT.JS 15 SAFE)
// GET /api/pages/[pageId]
// PATCH /api/pages/[pageId]
// DELETE /api/pages/[pageId]
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

/* ============================================================
   GET — Resolve page → site
============================================================ */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ REQUIRED in Next.js 15

  console.log("🏷️ [SITE][BY-PAGE][GET] START", { pageId });

  return apiHandler(async ({ ctx: authCtx }) => {
    console.log("🔐 [SITE][BY-PAGE] AuthContext", {
      tenantId: authCtx?.tenantId,
      userId: authCtx?.userId,
    });

    if (!authCtx?.tenantId || !authCtx?.userId) {
      console.warn("⚠️ [SITE][BY-PAGE] Unauthorized — missing session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId: authCtx.tenantId,
      },
      select: {
        site: {
          select: {
            id: true,
            logoUrl: true,
            designTokens: true,
          },
        },
      },
    });

    if (!page?.site) {
      console.warn("❌ [SITE][BY-PAGE] Site not found", { pageId });
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    console.log("✅ [SITE][BY-PAGE] Site resolved", {
      siteId: page.site.id,
    });

    return {
      success: true,
      site: page.site,
    };
  })(request);
}

/* ============================================================
   PATCH — Update title / slug
============================================================ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ REQUIRED

  console.log("✏️ [PAGE][PATCH] START", { pageId });

  return apiHandler(async ({ req }) => {
    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "page-patch",
      query: { pageId },
    });

    requirePermission(execCtx.auth, "editPage");

    const existing = await prisma.page.findFirst({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
      },
    });

    if (!existing) {
      throw new Error("Page not found");
    }

    const body = await req.json();
    const updates: any = { updatedAt: new Date() };

    if (body.title && body.title !== existing.title) {
      updates.title = body.title;
      updates.slug = `${body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-${existing.id.slice(0, 6)}`;
    }

    if (body.slug && !updates.slug) {
      updates.slug = body.slug;
    }

    await prisma.page.update({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
      },
      data: updates,
    });

    const updated = await prisma.page.findUnique({
      where: { id: execCtx.pageId },
      include: {
        site: { select: { slug: true } },
        blueprint: true,
      },
    });

    return {
      id: updated.id,
      siteId: updated.siteId,
      siteSlug: updated.site.slug,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      blueprint:
        updated.blueprint?.data ?? {
          page: { props: {}, children: [] },
        },
    };
  })(request);
}

/* ============================================================
   DELETE — Hard delete page
============================================================ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ REQUIRED

  console.log("🗑️ [PAGE][DELETE] START", { pageId });

  return apiHandler(async ({ req }) => {
    const execCtx: ExecutionContext = await resolveExecutionContext({
      req,
      scope: "page",
      source: "page-delete",
      query: { pageId },
    });

    requirePermission(execCtx.auth, "deletePage");

    const deleted = await prisma.page.deleteMany({
      where: {
        id: execCtx.pageId,
        siteId: execCtx.siteId,
      },
    });

    if (!deleted.count) {
      throw new Error("Page not found");
    }

    return { success: true };
  })(request);
}