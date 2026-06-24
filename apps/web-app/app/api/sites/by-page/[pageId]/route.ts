// app/api/sites/by-page/[pageId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

/* ============================================================
   GET — RESOLVE SITE BY PAGE ID
============================================================ */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params; // ✅ CORRECT (Next.js 15)

  const tenant = await verifyTenantAccess(req);
  if (!tenant) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!pageId) {
    return NextResponse.json(
      { error: "Missing pageId" },
      { status: 400 }
    );
  }

  /**
   * Page → Site resolution (tenant-safe)
   */
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      site: {
        tenantId: tenant.id,
      },
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
    return NextResponse.json(
      { error: "Site not found for page" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    site: {
      id: page.site.id,
      logoUrl: page.site.logoUrl,
      designTokens: page.site.designTokens,
    },
  });
}