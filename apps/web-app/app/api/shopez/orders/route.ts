import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const orders = await prisma.shopOrder.findMany({ where: { shopId: access.shop.id }, include: { items: true, customer: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null); const access = body && await authorizedShop(req, body.siteId || "");
  const order = access && await prisma.shopOrder.findFirst({ where: { id: body.orderId, shopId: access.shop.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const updated = await prisma.shopOrder.update({ where: { id: order.id }, data: { status: body.status, fulfillmentStatus: body.fulfillmentStatus, paymentStatus: body.paymentStatus } });
  return NextResponse.json({ order: updated });
}
