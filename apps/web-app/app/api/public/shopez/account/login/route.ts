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
    const customer = await prisma.shopCustomer.findUnique({
      where: { shopId_email: { shopId: shop.id, email } },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 25, include: { items: true } } },
    });
    if (!customer?.passwordHash || !(await bcrypt.compare(password, customer.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const session = await createCustomerSession(customer.id);
    const response = NextResponse.json({ customer: publicCustomer(customer) });
    setCustomerSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account login failed." },
      { status: 400 },
    );
  }
}
