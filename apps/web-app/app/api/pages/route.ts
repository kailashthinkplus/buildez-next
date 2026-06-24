// /apps/web-app/app/api/pages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

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

    if (siteSlug) {
      console.log("🟢 [PAGES][GET] Resolving site by slug:", siteSlug);

      const site = await prisma.site.findFirst({
        where: {
          slug: siteSlug,
          tenantId: tenant.id,
        },
        select: { id: true },
      });

      console.log("🟢 [PAGES][GET] Site resolved:", site);

      if (!site) {
        console.warn("🔴 [PAGES][GET] Site NOT FOUND for slug:", siteSlug);
        return { data: { pages: [], total: 0 } };
      }

      siteIds = [site.id];
    } else {
      console.log("🟢 [PAGES][GET] Resolving ALL sites for tenant");

      const sites = await prisma.site.findMany({
        where: { tenantId: tenant.id },
        select: { id: true },
      });

      siteIds = sites.map((s) => s.id);
      console.log("🟢 [PAGES][GET] Site IDs:", siteIds);
    }

    if (siteIds.length === 0) {
      console.warn("🔴 [PAGES][GET] No siteIds resolved");
      return { data: { pages: [], total: 0 } };
    }

    /* -------------------------------------------
       WHERE clause
    ------------------------------------------ */
    const where = {
      siteId: { in: siteIds },
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
          site: { select: { slug: true } },
        },
      }),
      prisma.page.count({ where }),
    ]);

    console.log("🟢 [PAGES][GET] Pages found:", pages.length, "Total:", total);

    return {
      data: {
        pages,
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("🟢 [PAGES][POST] Body:", body);

    const { title, siteSlug } = body ?? {};

    if (!title || typeof title !== "string") {
      console.warn("🔴 [PAGES][POST] Invalid title");
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!siteSlug || typeof siteSlug !== "string") {
      console.warn("🔴 [PAGES][POST] Missing siteSlug");
      return NextResponse.json(
        { error: "siteSlug is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.page.findFirst({
        where: {
          siteId: site.id,
          slug,
          deletedAt: null,
        },
        select: { id: true },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    console.log("🟢 [PAGES][POST] Final page slug:", slug);

    const page = await prisma.page.create({
      data: {
        siteId: site.id,
        title,
        slug,
        status: "DRAFT",
      },
      include: {
        site: { select: { slug: true } },
      },
    });

    console.log("🟢 [PAGES][POST] Page created:", page.id);

    return { data: page };
  })(request);
};
