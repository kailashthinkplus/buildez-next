import { prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { customerForRequest, publicCustomer, resolvePublicShop } from "@/lib/shopez/customerAuth";

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const shop = await resolvePublicShop(req, body);
  if (!shop) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const customer = await customerForRequest(req, shop.id);
  if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const data: Record<string, unknown> = {};
  if (typeof body.firstName === "string") data.firstName = body.firstName.trim() || null;
  if (typeof body.lastName === "string") data.lastName = body.lastName.trim() || null;
  if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body.acceptsMarketing === "boolean") data.acceptsMarketing = body.acceptsMarketing;
  if (Array.isArray(body.addresses)) data.addresses = body.addresses;
  const updated = await prisma.shopCustomer.update({
    where: { id: customer.id },
    data,
    include: { orders: { orderBy: { createdAt: "desc" }, take: 25, include: { items: true } } },
  });
  return NextResponse.json({ customer: publicCustomer(updated) });
}
