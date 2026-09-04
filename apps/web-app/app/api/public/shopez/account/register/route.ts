import bcrypt from "bcryptjs";
import { prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import {
  createCustomerSession,
  normalizeCustomerEmail,
  publicCustomer,
  resolvePublicShop,
  setCustomerSessionCookie,
  validateCustomerPassword,
} from "@/lib/shopez/customerAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const shop = await resolvePublicShop(req, body);
    if (!shop) return NextResponse.json({ error: "Store not found." }, { status: 404 });
    const email = normalizeCustomerEmail(body.email);
    const password = validateCustomerPassword(body.password);
    const existing = await prisma.shopCustomer.findUnique({
      where: { shopId_email: { shopId: shop.id, email } },
      select: { id: true, passwordHash: true },
    });
    if (existing?.passwordHash) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }
    const customer = existing
      ? await prisma.shopCustomer.update({
        where: { id: existing.id },
        data: {
          passwordHash: await bcrypt.hash(password, 12),
          firstName: String(body.firstName || "").trim() || undefined,
          lastName: String(body.lastName || "").trim() || undefined,
        },
        include: { orders: { orderBy: { createdAt: "desc" }, take: 25, include: { items: true } } },
      })
      : await prisma.shopCustomer.create({
        data: {
          shopId: shop.id,
          email,
          passwordHash: await bcrypt.hash(password, 12),
          firstName: String(body.firstName || "").trim() || null,
          lastName: String(body.lastName || "").trim() || null,
        },
        include: { orders: { orderBy: { createdAt: "desc" }, take: 25, include: { items: true } } },
      });
    const session = await createCustomerSession(customer.id);
    const response = NextResponse.json({ customer: publicCustomer(customer) }, { status: 201 });
    setCustomerSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account registration failed." },
      { status: 400 },
    );
  }
}
