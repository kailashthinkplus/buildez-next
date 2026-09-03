import crypto from "node:crypto";
import { prisma } from "@buildez/db";
import { NextRequest } from "next/server";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

export function shopHandle(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

export async function authorizedShop(req: NextRequest, siteId: string, create = true) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null } });
  if (!site) return null;
  let shop = await prisma.shop.findUnique({ where: { siteId } });
  if (!shop && create) shop = await prisma.shop.create({ data: { siteId, tenantId: tenant.id, name: site.name } });
  return shop ? { tenant, site, shop } : null;
}

function key() {
  const secret = process.env.SHOPEZ_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secret) throw new Error("SHOPEZ_ENCRYPTION_KEY is required to save payment credentials");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSecret(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function money(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100) / 100) : 0;
}

/** Marks a Shopez order as paid and decrements the inventory it reserved.
 * Shared by the client-driven verify endpoint (Razorpay/PayPal/Stripe/Dodo
 * return-flow confirmation) and provider webhooks (Stripe/Dodo), so both
 * paths agree on exactly what "paid" means for an order. */
export async function markShopOrderPaid(orderId: string, providerPaymentId?: string | null) {
  const order = await prisma.shopOrder.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return order;
  await prisma.$transaction([
    prisma.shopOrder.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED", providerPaymentId: providerPaymentId || undefined },
    }),
    ...order.items
      .filter((item) => item.variantId)
      .map((item) => prisma.shopProductVariant.update({
        where: { id: item.variantId! },
        data: { inventory: { decrement: item.quantity } },
      })),
  ]);
  return order;
}
