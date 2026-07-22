import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const customers = await prisma.shopCustomer.findMany({
    where: { shopId: access.shop.id },
    include: { orders: { select: { id: true, total: true, paymentStatus: true, createdAt: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const access = body && await authorizedShop(req, body.siteId || "");
  const customer = access && await prisma.shopCustomer.findFirst({ where: { id: body.customerId, shopId: access.shop.id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  const updated = await prisma.shopCustomer.update({ where: { id: customer.id }, data: { firstName: body.firstName, lastName: body.lastName, phone: body.phone, notes: body.notes, acceptsMarketing: body.acceptsMarketing } });
  return NextResponse.json({ customer: updated });
}
