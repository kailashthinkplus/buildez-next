import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@buildez/db";
import type { NextRequest, NextResponse } from "next/server";

import { isActivePreviewSession } from "@/modules/builder-v3/preview/PreviewSessionManager";

export const SHOP_CUSTOMER_COOKIE = "shopez_customer_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export function normalizeCustomerEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}

export function validateCustomerPassword(value: unknown) {
  const password = String(value || "");
  if (password.length < 8 || password.length > 128) {
    throw new Error("Password must be between 8 and 128 characters.");
  }
  return password;
}

export function customerTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function resolvePublicShop(
  req: NextRequest,
  input: { siteId?: unknown; siteSlug?: unknown },
) {
  const previewSessionId = req.headers.get("x-buildez-preview-session") || "";
  const previewSiteId = req.headers.get("x-buildez-preview-site") || "";
  const isPreview = Boolean(
    previewSessionId
    && previewSiteId
    && isActivePreviewSession(previewSessionId, previewSiteId),
  );
  const siteId = isPreview ? previewSiteId : String(input.siteId || "");
  const siteSlug = String(input.siteSlug || "");
  return prisma.shop.findFirst({
    where: {
      ...(siteId ? { siteId } : { site: { slug: siteSlug, deletedAt: null } }),
      ...(isPreview ? {} : { isPublished: true }),
    },
    select: { id: true, siteId: true, name: true, currency: true },
  });
}

export async function createCustomerSession(customerId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.shopCustomerSession.create({
    data: { customerId, tokenHash: customerTokenHash(token), expiresAt },
  });
  return { token, expiresAt };
}

export function setCustomerSessionCookie(
  response: NextResponse,
  session: { token: string; expiresAt: Date },
) {
  response.cookies.set({
    name: SHOP_CUSTOMER_COOKIE,
    value: session.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/public/shopez/account",
    expires: session.expiresAt,
  });
}

export async function customerForRequest(req: NextRequest, shopId: string) {
  const token = req.cookies.get(SHOP_CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.shopCustomerSession.findUnique({
    where: { tokenHash: customerTokenHash(token) },
    include: {
      customer: {
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 25,
            include: { items: true },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || session.customer.shopId !== shopId) {
    if (session) {
      await prisma.shopCustomerSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }
  return session.customer;
}

export function publicCustomer(customer: NonNullable<Awaited<ReturnType<typeof customerForRequest>>>) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    addresses: customer.addresses,
    orders: customer.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      currency: order.currency,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items,
    })),
  };
}
