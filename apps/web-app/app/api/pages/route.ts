// /apps/web-app/app/api/pages/route.ts

import { NextRequest } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { createInsightReport } from "@/modules/insights/server";
import { ApiError } from "@/lib/api/errors";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function countRecommendations(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  return asNumber(value) ?? 0;
}

/* ============================================================
   GET — LIST PAGES
============================================================ */
export const GET = async (request: NextRequest) => {
  return apiHandler(async ({ req }) => {
    console.log("🟢 [PAGES][GET] Incoming request:", req.url);

    const tenant = await verifyTenantAccess(req);
    console.log("🟢 [PAGES][GET] Tenant resolved:", tenant?.id);

    if (!tenant) {
      console.warn("🔴 [PAGES][GET] No tenant — returning empty");
      return { data: { pages: [], total: 0 } };
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const take = Number(url.searchParams.get("take") ?? 10);
    const skip = Number(url.searchParams.get("skip") ?? 0);
    const siteSlug = url.searchParams.get("siteSlug");
    const trash = url.searchParams.get("trash") === "true";

    console.log("🟢 [PAGES][GET] Params:", {
      search,
      take,
      skip,
      siteSlug,
    });

    /* -------------------------------------------
       Resolve SITE IDS
    ------------------------------------------ */
    let siteIds: string[] = [];
    const frontPageBySite = new Map<string, string>();

    if (siteSlug) {
      console.log("🟢 [PAGES][GET] Resolving site by slug:", siteSlug);

      const site = await prisma.site.findFirst({
        where: {
          slug: siteSlug,
          tenantId: tenant.id,
        },
        select: { id: true, settings: true },
      });

      console.log("🟢 [PAGES][GET] Site resolved:", site);

      if (!site) {
        console.warn("🔴 [PAGES][GET] Site NOT FOUND for slug:", siteSlug);
        return { data: { pages: [], total: 0 } };
      }

      siteIds = [site.id];
      frontPageBySite.set(site.id, asString(asRecord(site.settings).frontPageId));
    } else {
      console.log("🟢 [PAGES][GET] Resolving ALL sites for tenant");

      const sites = await prisma.site.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, settings: true },
      });

      siteIds = sites.map((s) => s.id);
      sites.forEach((resolvedSite) => {
        frontPageBySite.set(
          resolvedSite.id,
          asString(asRecord(resolvedSite.settings).frontPageId),
        );
      });
      console.log("🟢 [PAGES][GET] Site IDs:", siteIds);
    }

    if (siteIds.length === 0) {
      console.warn("🔴 [PAGES][GET] No siteIds resolved");
      return { data: { pages: [], total: 0 } };
    }

    /* -------------------------------------------
       WHERE clause
    ------------------------------------------ */
    const where: Prisma.PageWhereInput = {
      siteId: { in: siteIds },
      deletedAt: trash ? { not: null } : null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    console.log("🟢 [PAGES][GET] Prisma where clause:", where);

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          site: {
            select: {
              id: true,
              slug: true,
              v12Project: { select: { id: true } },
            },
          },
          blueprint: { select: { id: true } },
        },
      }),
      prisma.page.count({ where }),
    ]);

    console.log("🟢 [PAGES][GET] Pages found:", pages.length, "Total:", total);

    const insightReports = await Promise.all(
      siteIds.map(async (siteId) => {
        try {
          return await createInsightReport({ siteId, tenantId: tenant.id });
        } catch {
          return null;
        }
      }),
    );
    const aiScores = new Map(
      insightReports.flatMap((report) =>
        report?.pages.map((page) => [page.id, page.score] as const) ?? [],
      ),
    );

    const normalizedPages = pages.map((page) => {
      const metadata = asRecord(page.metadata);
      const seoTitle = asString(metadata.seoTitle);
      const seoDescription = asString(metadata.seoDescription);
      const faviconUrl = asString(metadata.faviconUrl);
      const requiredFields = [
        page.title,
        page.slug,
        seoTitle,
        seoDescription,
        faviconUrl,
      ];
      const requiredFieldsCompleted = requiredFields.filter(Boolean).length;
      const requiredFieldsTotal = requiredFields.length;

      return {
        ...page,
        seoTitle,
        seoDescription,
        faviconUrl,
        screenshotUrl:
          asString(metadata.screenshotUrl) ||
          asString(metadata.thumbnailUrl) ||
          asString(metadata.previewImageUrl) ||
          asString(metadata.previewUrl) ||
          asString(metadata.ogImage),
        hasMeaningfulPreview:
          Boolean(page.blueprint) ||
          Boolean(page.reactCode && page.reactCode.trim().length > 80) ||
          (page.renderMode === "REACT" && Boolean(page.site.v12Project)),
        aiScore: aiScores.get(page.id) ?? 0,
        isFrontPage: frontPageBySite.get(page.siteId) === page.id,
        aiRecommendationsTotal:
          countRecommendations(metadata.aiRecommendations) ||
          countRecommendations(metadata.recommendations) ||
          countRecommendations(metadata.aiRecommendationCount),
        requiredFieldsCompleted:
          asNumber(metadata.requiredFieldsCompleted) ?? requiredFieldsCompleted,
        requiredFieldsTotal:
          asNumber(metadata.requiredFieldsTotal) ?? requiredFieldsTotal,
      };
    });

    return {
      data: {
        pages: normalizedPages,
        total,
      },
    };
  })(request);
};

/* ============================================================
   POST — CREATE PAGE
============================================================ */
export const POST = async (request: NextRequest) => {
  return apiHandler(async ({ req }) => {
    console.log("🟢 [PAGES][POST] Incoming request");

    const tenant = await verifyTenantAccess(req);
    console.log("🟢 [PAGES][POST] Tenant resolved:", tenant?.id);

    if (!tenant) {
      console.warn("🔴 [PAGES][POST] Unauthorized");
      throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const body = await req.json();
    console.log("🟢 [PAGES][POST] Body:", body);

    const { title, siteSlug } = body ?? {};

    if (!title || typeof title !== "string") {
      console.warn("🔴 [PAGES][POST] Invalid title");
      throw new ApiError("Title is required", 400, "INVALID_TITLE");
    }

    if (!siteSlug || typeof siteSlug !== "string") {
      console.warn("🔴 [PAGES][POST] Missing siteSlug");
      throw new ApiError("siteSlug is required", 400, "SITE_SLUG_REQUIRED");
    }

    console.log("🟢 [PAGES][POST] Resolving site:", siteSlug);

    const site = await prisma.site.findFirst({
      where: {
        slug: siteSlug,
        tenantId: tenant.id,
      },
      select: { id: true },
    });

    console.log("🟢 [PAGES][POST] Site resolved:", site);

    if (!site) {
      console.warn("🔴 [PAGES][POST] Site not found:", siteSlug);
      throw new ApiError("Site not found", 404, "SITE_NOT_FOUND");
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const safeBaseSlug = baseSlug || "page";

let slug = safeBaseSlug;
let counter = 2;

while (
  await prisma.page.findFirst({
    where: {
      siteId: site.id,
      slug,
    },
    select: { id: true },
  })
) {
  slug = `${safeBaseSlug}-${counter++}`;
}

    console.log("🟢 [PAGES][POST] Final page slug:", slug);

    const page = await prisma.page.create({
      data: {
        siteId: site.id,
        title: title.trim(),
        slug,
        status: "DRAFT",
        metadata: {
          seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : title.trim(),
          seoDescription: typeof body.seoDescription === "string" ? body.seoDescription : "",
          faviconUrl: typeof body.faviconUrl === "string" ? body.faviconUrl : "",
        },
      },
      include: {
        site: { select: { id: true, slug: true } },
      },
    });

    console.log("🟢 [PAGES][POST] Page created:", page.id);

    return { data: page };
  })(request);
};
