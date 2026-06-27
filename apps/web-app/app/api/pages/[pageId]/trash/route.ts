// /app/api/pages/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

export const GET = apiHandler(async ({ req, auth }) => {
  const request = req as NextRequest;
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt_desc";
  const filter = searchParams.get("filter") || "all"; // ⭐ NEW
  const skip = Number(searchParams.get("skip") || 0);
  const take = Number(searchParams.get("take") || 10);

  /* -----------------------------------------------------------
     Sorting map
  ----------------------------------------------------------- */
  const sortMap: Record<string, any> = {
    createdAt_desc: { createdAt: "desc" },
    createdAt_asc: { createdAt: "asc" },
    title_asc: { title: "asc" },
    title_desc: { title: "desc" },
    slug_asc: { slug: "asc" },
    slug_desc: { slug: "desc" },
  };

  const orderBy = sortMap[sort] || sortMap["createdAt_desc"];

  /* -----------------------------------------------------------
     Get all site IDs under this tenant
  ----------------------------------------------------------- */
  const sites = await prisma.site.findMany({
    where: { tenantId: auth.tenant.id },
    select: { id: true },
  });

  const siteIds = sites.map((s) => s.id);
  if (siteIds.length === 0) {
    return { pages: [], total: 0 };
  }

  /* -----------------------------------------------------------
     WHERE filters (search + filter)
  ----------------------------------------------------------- */
  const where: any = {
    siteId: { in: siteIds },
    deletedAt: { not: null },
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ],
  };

  if (filter === "published") where.status = "PUBLISHED";
  if (filter === "draft") where.status = "DRAFT";

  /* -----------------------------------------------------------
     Query DB
  ----------------------------------------------------------- */
  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    prisma.page.count({ where }),
  ]);

  return { pages, total };
});
