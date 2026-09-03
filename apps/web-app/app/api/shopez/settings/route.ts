import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop, encryptSecret, money } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const payments = await prisma.shopPaymentIntegration.findMany({ where: { shopId: access.shop.id }, select: { id: true, provider: true, enabled: true, publicKey: true, mode: true, metadata: true, webhookSecret: true, updatedAt: true } });
  return NextResponse.json({ shop: access.shop, payments: payments.map((x) => ({ ...x, webhookSecret: undefined, hasWebhookSecret: Boolean(x.webhookSecret) })) });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json().catch(() => null); const access = b && await authorizedShop(req, b.siteId || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (b.provider) {
    const provider = String(b.provider).toUpperCase() as "RAZORPAY" | "PAYPAL" | "STRIPE" | "DODO" | "COD";
    const payment = await prisma.shopPaymentIntegration.upsert({ where: { shopId_provider: { shopId: access.shop.id, provider } }, create: { shopId: access.shop.id, provider, enabled: Boolean(b.enabled), publicKey: b.publicKey || null, encryptedSecret: b.secret ? encryptSecret(b.secret) : null, webhookSecret: b.webhookSecret ? encryptSecret(b.webhookSecret) : null, mode: b.mode || "test", metadata: b.metadata ?? undefined }, update: { enabled: Boolean(b.enabled), publicKey: b.publicKey || undefined, encryptedSecret: b.secret ? encryptSecret(b.secret) : undefined, webhookSecret: b.webhookSecret ? encryptSecret(b.webhookSecret) : undefined, mode: b.mode || undefined, metadata: b.metadata ?? undefined } });
    return NextResponse.json({ payment: { ...payment, encryptedSecret: undefined, webhookSecret: undefined } });
  }
  const shop = await prisma.shop.update({ where: { id: access.shop.id }, data: { name: b.name, currency: b.currency, country: b.country, supportEmail: b.supportEmail || null, taxInclusive: Boolean(b.taxInclusive), taxRate: money(b.taxRate), flatShippingRate: money(b.flatShippingRate), freeShippingOver: b.freeShippingOver ? money(b.freeShippingOver) : null, isPublished: Boolean(b.isPublished) } });
  return NextResponse.json({ shop });
}
