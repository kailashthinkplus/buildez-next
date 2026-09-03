// ============================================================================
// PAGE ROUTE — V5 (NEXT.JS 15 SAFE)
// GET /api/pages/[pageId]
// PATCH /api/pages/[pageId]
// DELETE /api/pages/[pageId]
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { archiveDesignTokens } from "@/modules/pages/designTokenRegistration";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { invalidateRouteCache } from "@/lib/runtime/routeCache";

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
        faviconUrl: String(asRecord(page.metadata).faviconUrl ?? ""),
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
      typeof body.seoDescription === "string" ||
      typeof body.faviconUrl === "string" ||
      typeof body.socialImageUrl === "string"
    ) {
      // Only overwrite keys actually present in the request — a metadata
      // field omitted from `body` must keep its existing saved value, not
      // be wiped to `undefined` (which JSON-serializes away entirely).
      const nextMetadata = { ...asRecord(existing.metadata) };
      if (typeof body.seoTitle === "string") nextMetadata.seoTitle = body.seoTitle;
      if (typeof body.seoDescription === "string") nextMetadata.seoDescription = body.seoDescription;
      if (typeof body.faviconUrl === "string") nextMetadata.faviconUrl = body.faviconUrl;
      if (typeof body.socialImageUrl === "string") nextMetadata.socialImageUrl = body.socialImageUrl;
      updates.metadata = nextMetadata as Prisma.InputJsonValue;
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
      faviconUrl: String(metadata.faviconUrl ?? ""),
      socialImageUrl: String(metadata.socialImageUrl ?? ""),
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
    const result = await prisma.$transaction(async (tx) => {
      const page = await tx.page.findFirst({
        where: {
          id: pageId,
          deleted: false,
          deletedAt: null,
          site: {
            tenantId: auth.tenant.id,
          },
        },
        select: {
          id: true,
          siteId: true,
          slug: true,
          site: {
            select: {
              slug: true,
              designTokens: true,
              settings: true,
            },
          },
        },
      });

      if (!page) {
        throw new Error("Page not found");
      }

      await tx.page.update({
        where: { id: page.id },
        data: {
          deleted: true,
          deletedAt: new Date(),
          deletedByUser: auth.user.id,
        },
      });

      // Design tokens belong to the site's active page collection. Once the
      // final active page is removed, clear the canonical registration so a
      // future page cannot inherit an orphaned theme from the deleted site.
      const clearedSite = await tx.site.updateMany({
        where: {
          id: page.siteId,
          tenantId: auth.tenant.id,
          deletedAt: null,
          pages: {
            none: {
              deleted: false,
              deletedAt: null,
            },
          },
        },
        data: {
          designTokens: Prisma.DbNull,
          ...(page.site.designTokens == null
            ? {}
            : {
                settings: archiveDesignTokens(
                  page.site.settings,
                  page.site.designTokens,
                ) as Prisma.InputJsonValue,
              }),
        },
      });

      return {
        designTokensCleared: clearedSite.count > 0,
        siteSlug: page.site.slug,
        pageSlug: page.slug,
      };
    });

    // A deleted page must stop rendering everywhere it was ever reachable —
    // the auth-gated builder preview, the published site, and the site root
    // (in case the deleted page was the homepage).
    revalidatePath(`/preview/${result.siteSlug}/${result.pageSlug}`);
    revalidatePath(publishedSitePath(result.siteSlug, result.pageSlug));
    revalidatePath(publishedSitePath(result.siteSlug));
    invalidateRouteCache(result.siteSlug);

    return {
      success: true,
      designTokensCleared: result.designTokensCleared,
    };
  })(request);
}
