import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [products, orders, customers, revenue, recent, paidOrders, topProducts, topCustomers, enabledGateways] = await Promise.all([
    prisma.shopProduct.count({ where: { shopId: access.shop.id } }),
    prisma.shopOrder.count({ where: { shopId: access.shop.id } }),
    prisma.shopCustomer.count({ where: { shopId: access.shop.id } }),
    prisma.shopOrder.aggregate({ where: { shopId: access.shop.id, paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.shopOrder.findMany({ where: { shopId: access.shop.id }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.shopOrder.findMany({ where: { shopId: access.shop.id, paymentStatus: "PAID", createdAt: { gte: since } }, select: { total: true, createdAt: true } }),
    prisma.shopOrderItem.groupBy({ by: ["title"], where: { order: { shopId: access.shop.id } }, _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    prisma.shopCustomer.findMany({ where: { shopId: access.shop.id }, include: { orders: { select: { total: true } } }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.shopPaymentIntegration.count({ where: { shopId: access.shop.id, enabled: true } }),
  ]);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate() - (6 - index));
    const next = new Date(date); next.setDate(next.getDate() + 1);
    return { date: date.toISOString().slice(0,10), revenue: paidOrders.filter(order => order.createdAt >= date && order.createdAt < next).reduce((sum, order) => sum + Number(order.total), 0) };
  });
  const customerLeaders = topCustomers.map(customer => ({ id: customer.id, name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email, email: customer.email, orders: customer.orders.length, spend: customer.orders.reduce((sum, order) => sum + Number(order.total), 0) })).sort((a,b) => b.spend - a.spend).slice(0,5);
  return NextResponse.json({ shop: access.shop, hasPaymentGateway: enabledGateways > 0, metrics: { products, orders, customers, revenue: Number(revenue._sum.total || 0), dailySales: days, topProducts: topProducts.map(item => ({ title: item.title, units: item._sum.quantity || 0, revenue: Number(item._sum.total || 0) })), topCustomers: customerLeaders }, recent });
}
