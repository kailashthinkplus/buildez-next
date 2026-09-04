import { prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import {
  customerForRequest,
  customerTokenHash,
  publicCustomer,
  resolvePublicShop,
  SHOP_CUSTOMER_COOKIE,
} from "@/lib/shopez/customerAuth";

export async function GET(req: NextRequest) {
  const shop = await resolvePublicShop(req, {
    siteId: req.nextUrl.searchParams.get("siteId"),
    siteSlug: req.nextUrl.searchParams.get("siteSlug"),
  });
  if (!shop) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const customer = await customerForRequest(req, shop.id);
  return NextResponse.json({ customer: customer ? publicCustomer(customer) : null });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SHOP_CUSTOMER_COOKIE)?.value;
  if (token) {
    await prisma.shopCustomerSession.deleteMany({
      where: { tokenHash: customerTokenHash(token) },
    });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SHOP_CUSTOMER_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/public/shopez/account",
    maxAge: 0,
  });
  return response;
}
