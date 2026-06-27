// ============================================================================
// PAGE ROUTE — V5 (NEXT.JS 15 SAFE)
// GET /api/pages/[pageId]
// PATCH /api/pages/[pageId]
// DELETE /api/pages/[pageId]
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/* ============================================================
   GET — Resolve page → site
============================================================ */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ REQUIRED in Next.js 15

  console.log("🏷️ [SITE][BY-PAGE][GET] START", { pageId });

  return apiHandler(async ({ auth }) => {
    console.log("🔐 [SITE][BY-PAGE] AuthContext", {
      tenantId: auth.tenant?.id,
      userId: auth.user?.id,
    });

    if (!auth.tenant?.id || !auth.user?.id) {
      console.warn("⚠️ [SITE][BY-PAGE] Unauthorized — missing session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        metadata: true,
        site: {
          select: {
            id: true,
            slug: true,
            logoUrl: true,
            designTokens: true,
          },
        },
        blueprint: {
          select: {
            data: true,
          },
        },
      },
    });

    if (!page) {
      console.warn("❌ [SITE][BY-PAGE] Site not found", { pageId });
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    console.log("✅ [SITE][BY-PAGE] Site resolved", {
      siteId: page.site.id,
    });

    return {
      success: true,
      site: page.site,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        siteSlug: page.site.slug,
        seoTitle: String(asRecord(page.metadata).seoTitle ?? ""),
        seoDescription: String(asRecord(page.metadata).seoDescription ?? ""),
        blueprint: page.blueprint?.data ?? null,
      },
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

  return apiHandler(async ({ req, auth }) => {
    const existing = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      include: {
        site: { select: { slug: true } },
        blueprint: true,
      },
    });

    if (!existing) {
      throw new Error("Page not found");
    }

    const body = await req.json();
    const updates: Prisma.PageUpdateInput = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }

    if (typeof body.slug === "string" && body.slug.trim()) {
      const nextSlug = slugify(body.slug);
      if (!nextSlug) {
        throw new Error("Slug is required");
      }

      const conflict = await prisma.page.findFirst({
        where: {
          siteId: existing.siteId,
          slug: nextSlug,
          id: { not: existing.id },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new Error("A page with this slug already exists");
      }

      updates.slug = nextSlug;
    }

    if (
      typeof body.seoTitle === "string" ||
      typeof body.seoDescription === "string"
    ) {
      updates.metadata = {
        ...asRecord(existing.metadata),
        seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : undefined,
        seoDescription:
          typeof body.seoDescription === "string" ? body.seoDescription : undefined,
      };
    }

    await prisma.page.update({
      where: { id: existing.id },
      data: updates,
    });

    const updated = await prisma.page.findUnique({
      where: { id: existing.id },
      include: {
        site: { select: { slug: true } },
        blueprint: true,
      },
    });

    if (!updated) {
      throw new Error("Page not found after update");
    }

    const metadata = asRecord(updated.metadata);

    return {
      id: updated.id,
      siteId: updated.siteId,
      siteSlug: updated.site.slug,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      seoTitle: String(metadata.seoTitle ?? ""),
      seoDescription: String(metadata.seoDescription ?? ""),
      blueprint:
        updated.blueprint?.data ?? {
          page: { props: {}, children: [] },
        },
    };
  })(request);
}

/* ============================================================
   DELETE — Soft delete page
============================================================ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ REQUIRED

  console.log("🗑️ [PAGE][DELETE] START", { pageId });

  return apiHandler(async ({ auth }) => {
    const deleted = await prisma.page.updateMany({
      where: {
        id: pageId,
        deletedAt: null,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedByUser: auth.user.id,
      },
    });

    if (!deleted.count) {
      throw new Error("Page not found");
    }

    return { success: true };
  })(request);
}
