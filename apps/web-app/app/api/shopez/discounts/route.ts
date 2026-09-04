import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop, money } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  return NextResponse.json({ discounts: await prisma.shopDiscount.findMany({ where: { shopId: access.shop.id }, orderBy: { startsAt: "desc" } }) });
}
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null); const access = b && await authorizedShop(req, b.siteId || "");
  if (!access || !b.code) return NextResponse.json({ error: "Discount code is required" }, { status: 400 });
  const discount = await prisma.shopDiscount.create({ data: { shopId: access.shop.id, code: String(b.code).trim().toUpperCase(), type: b.type || "PERCENTAGE", value: money(b.value), minimumAmount: b.minimumAmount ? money(b.minimumAmount) : null, usageLimit: b.usageLimit ? Number(b.usageLimit) : null, endsAt: b.endsAt ? new Date(b.endsAt) : null } });
  return NextResponse.json({ discount }, { status: 201 });
}
