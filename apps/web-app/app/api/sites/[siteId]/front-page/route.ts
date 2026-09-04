import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const body = await req.json().catch(() => null);
  const pageId = typeof body?.pageId === "string" ? body.pageId.trim() : "";
  if (!pageId) return NextResponse.json({ error: "Choose a page" }, { status: 400 });

  const [site, page] = await Promise.all([
    prisma.site.findFirst({
      where: { id: siteId, tenantId: tenant.id, deletedAt: null },
      select: { id: true, settings: true },
    }),
    prisma.page.findFirst({
      where: { id: pageId, siteId, deletedAt: null },
      select: { id: true, title: true, slug: true },
    }),
  ]);
  if (!site || !page) {
    return NextResponse.json(
      { error: "That page does not belong to this website" },
      { status: 404 },
    );
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { settings: { ...asRecord(site.settings), frontPageId: page.id } },
  });
  return NextResponse.json({ success: true, page });
}
