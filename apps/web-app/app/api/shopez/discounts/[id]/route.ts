import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop, money } from "@/lib/shopez";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => null);
  const access = b && (await authorizedShop(req, b.siteId || ""));
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const existing = await prisma.shopDiscount.findFirst({ where: { id, shopId: access.shop.id } });
  if (!existing) return NextResponse.json({ error: "Discount not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (b.code !== undefined) data.code = String(b.code).trim().toUpperCase();
  if (b.type !== undefined) data.type = b.type;
  if (b.value !== undefined) data.value = money(b.value);
  if (b.minimumAmount !== undefined) data.minimumAmount = b.minimumAmount ? money(b.minimumAmount) : null;
  if (b.usageLimit !== undefined) data.usageLimit = b.usageLimit ? Number(b.usageLimit) : null;
  if (b.startsAt !== undefined) data.startsAt = b.startsAt ? new Date(b.startsAt) : new Date();
  if (b.endsAt !== undefined) data.endsAt = b.endsAt ? new Date(b.endsAt) : null;
  if (b.active !== undefined) data.active = Boolean(b.active);

  const discount = await prisma.shopDiscount.update({ where: { id }, data });
  return NextResponse.json({ discount });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = req.nextUrl.searchParams.get("siteId") || "";
  const access = await authorizedShop(req, siteId);
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const existing = await prisma.shopDiscount.findFirst({ where: { id, shopId: access.shop.id } });
  if (!existing) return NextResponse.json({ error: "Discount not found" }, { status: 404 });

  await prisma.shopDiscount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
