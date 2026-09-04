import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

// Read-only status check — unlike authorizedShop() this never creates a Shop
// row, so it's safe to poll from dashboards that don't otherwise touch ShopEZ.
export async function GET(req: NextRequest) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = req.nextUrl.searchParams.get("siteId") || "";
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null }, select: { id: true } });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const shop = await prisma.shop.findUnique({
    where: { siteId },
    select: { isPublished: true, _count: { select: { payments: { where: { enabled: true } } } } },
  });
  if (!shop) return NextResponse.json({ enabled: false, hasPaymentGateway: false });

  return NextResponse.json({ enabled: shop.isPublished, hasPaymentGateway: shop._count.payments > 0 });
}
