import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const [products, orders, customers, revenue, recent] = await Promise.all([
    prisma.shopProduct.count({ where: { shopId: access.shop.id } }),
    prisma.shopOrder.count({ where: { shopId: access.shop.id } }),
    prisma.shopCustomer.count({ where: { shopId: access.shop.id } }),
    prisma.shopOrder.aggregate({ where: { shopId: access.shop.id, paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.shopOrder.findMany({ where: { shopId: access.shop.id }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return NextResponse.json({ shop: access.shop, metrics: { products, orders, customers, revenue: Number(revenue._sum.total || 0) }, recent });
}
