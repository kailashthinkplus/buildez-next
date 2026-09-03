import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import Stripe from "stripe";
import DodoPayments from "dodopayments";
import { decryptSecret, money } from "@/lib/shopez";
import { isActivePreviewSession } from "@/modules/builder-v3/preview/PreviewSessionManager";
import type { TaxCategory } from "dodopayments/resources/misc";

type CartLine = { variantId: string; quantity: number };
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null); const lines: CartLine[] = Array.isArray(b?.items) ? b.items : [];
  if (!b?.siteId || !b.email || !lines.length) return NextResponse.json({ error: "Email, address, and cart items are required" }, { status: 400 });
  const previewSessionId = req.headers.get("x-buildez-preview-session") || "";
  const previewSiteId = req.headers.get("x-buildez-preview-site") || "";
  const isPreview = Boolean(
    previewSessionId
    && previewSiteId === b.siteId
    && isActivePreviewSession(previewSessionId, previewSiteId),
  );
  const shop = await prisma.shop.findFirst({ where: { siteId: b.siteId, ...(isPreview ? {} : { isPublished: true }) }, include: { payments: true } });
  if (!shop) return NextResponse.json({ error: "Store not available" }, { status: 404 });
  const ids = [...new Set(lines.map(x => x.variantId))]; const variants = await prisma.shopProductVariant.findMany({ where: { id: { in: ids }, product: { shopId: shop.id, status: "ACTIVE" } }, include: { product: true } });
  if (variants.length !== ids.length) return NextResponse.json({ error: "One or more products are unavailable" }, { status: 409 });
  let subtotal = 0; const items = [];
  for (const line of lines) { const variant = variants.find(x => x.id === line.variantId)!; const quantity = Math.max(1, Math.min(99, Math.floor(line.quantity))); if (variant.product.trackQuantity && variant.inventory < quantity && !variant.product.continueSelling) return NextResponse.json({ error: `${variant.product.title} has insufficient stock` }, { status: 409 }); const total = Number(variant.price) * quantity; subtotal += total; items.push({ productId: variant.productId, variantId: variant.id, title: variant.product.title, variantTitle: variant.title, sku: variant.sku, quantity, unitPrice: variant.price, total }); }
  let discountAmount = 0, discountId: string | undefined; let freeShipping = false;
  if (b.discountCode) { const d = await prisma.shopDiscount.findUnique({ where: { shopId_code: { shopId: shop.id, code: String(b.discountCode).trim().toUpperCase() } } }); if (d && d.active && d.startsAt <= new Date() && (!d.endsAt || d.endsAt > new Date()) && (!d.usageLimit || d.usageCount < d.usageLimit) && (!d.minimumAmount || subtotal >= Number(d.minimumAmount))) { discountId = d.id; if (d.type === "PERCENTAGE") discountAmount = subtotal * Math.min(100, Number(d.value)) / 100; else if (d.type === "FIXED_AMOUNT") discountAmount = Math.min(subtotal, Number(d.value)); else freeShipping = true; } }
  const shipping = freeShipping || (shop.freeShippingOver && subtotal >= Number(shop.freeShippingOver)) ? 0 : Number(shop.flatShippingRate); const taxable = Math.max(0, subtotal - discountAmount); const tax = shop.taxInclusive ? 0 : taxable * Number(shop.taxRate) / 100; const total = money(taxable + shipping + tax);
  const provider = String(b.provider || "COD").toUpperCase() as "RAZORPAY" | "PAYPAL" | "STRIPE" | "DODO" | "COD"; const integration = shop.payments.find(x => x.provider === provider && x.enabled);
  if (provider !== "COD" && !integration) return NextResponse.json({ error: `${provider} is not enabled` }, { status: 400 });
  const customer = await prisma.shopCustomer.upsert({ where: { shopId_email: { shopId: shop.id, email: String(b.email).toLowerCase() } }, create: { shopId: shop.id, email: String(b.email).toLowerCase(), firstName: b.firstName, lastName: b.lastName, phone: b.phone, addresses: [b.shippingAddress] }, update: { firstName: b.firstName, lastName: b.lastName, phone: b.phone, addresses: [b.shippingAddress] } });
  const last = await prisma.shopOrder.aggregate({ where: { shopId: shop.id }, _max: { orderNumber: true } });
  const order = await prisma.shopOrder.create({ data: { shopId: shop.id, customerId: customer.id, discountId, orderNumber: (last._max.orderNumber || 1000) + 1, email: customer.email, phone: b.phone, currency: shop.currency, subtotal: money(subtotal), discount: money(discountAmount), shipping: money(shipping), tax: money(tax), total, shippingAddress: b.shippingAddress || {}, billingAddress: b.billingAddress || b.shippingAddress || {}, note: b.note, provider, status: provider === "COD" ? "CONFIRMED" : "PENDING", items: { create: items } } });
  if (discountId) await prisma.shopDiscount.update({ where: { id: discountId }, data: { usageCount: { increment: 1 } } });
  if (provider === "COD") { await reserveInventory(lines); return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, provider, status: "confirmed" }); }
  if (provider === "RAZORPAY") { const secret = decryptSecret(integration!.encryptedSecret!); const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${integration!.publicKey}:${secret}`).toString("base64")}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.round(total * 100), currency: shop.currency, receipt: order.id, notes: { shopezOrderId: order.id } }) }); const remote = await response.json(); if (!response.ok) return NextResponse.json({ error: "Razorpay could not create the payment", detail: remote }, { status: 502 }); await prisma.shopOrder.update({ where: { id: order.id }, data: { providerOrderId: remote.id } }); return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, provider, paymentOrderId: remote.id, publicKey: integration!.publicKey, amount: Math.round(total * 100), currency: shop.currency }); }
  if (provider === "PAYPAL") { const secret = decryptSecret(integration!.encryptedSecret!); const base = integration!.mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"; const tokenRes = await fetch(`${base}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${integration!.publicKey}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" }); const token = await tokenRes.json(); if (!tokenRes.ok) return NextResponse.json({ error: "PayPal authentication failed" }, { status: 502 }); const payRes = await fetch(`${base}/v2/checkout/orders`, { method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: order.id, amount: { currency_code: shop.currency, value: total.toFixed(2) } }], application_context: { return_url: b.returnUrl, cancel_url: b.cancelUrl } }) }); const remote = await payRes.json(); if (!payRes.ok) return NextResponse.json({ error: "PayPal could not create the payment", detail: remote }, { status: 502 }); await prisma.shopOrder.update({ where: { id: order.id }, data: { providerOrderId: remote.id } }); return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, provider, paymentOrderId: remote.id, approvalUrl: remote.links?.find((x: { rel: string }) => x.rel === "approve")?.href }); }
  if (provider === "STRIPE") {
    const stripe = new Stripe(decryptSecret(integration!.encryptedSecret!));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      line_items: [{ quantity: 1, price_data: { currency: shop.currency.toLowerCase(), unit_amount: Math.round(total * 100), product_data: { name: `Order #${order.orderNumber} · ${shop.name}` } } }],
      success_url: b.returnUrl || b.cancelUrl || "https://buildez.app",
      cancel_url: b.cancelUrl || b.returnUrl || "https://buildez.app",
      metadata: { shopezOrderId: order.id },
    });
    await prisma.shopOrder.update({ where: { id: order.id }, data: { providerOrderId: session.id } });
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, provider, approvalUrl: session.url });
  }
  if (provider === "DODO") {
    const client = new DodoPayments({ bearerToken: decryptSecret(integration!.encryptedSecret!), environment: integration!.mode === "live" ? "live_mode" : "test_mode" });
    const taxCategory = ((integration!.metadata as Record<string, unknown> | null)?.taxCategory as TaxCategory) || "saas";
    const product = await client.products.create({ name: `Order #${order.orderNumber} · ${shop.name}`, tax_category: taxCategory, price: { type: "one_time_price", currency: shop.currency as never, price: Math.round(total * 100), discount: 0, tax_inclusive: shop.taxInclusive } });
    const session = await client.checkoutSessions.create({ product_cart: [{ product_id: product.product_id, quantity: 1 }], customer: { email: customer.email, name: `${b.firstName || ""} ${b.lastName || ""}`.trim() || customer.email }, return_url: b.returnUrl, metadata: { shopezOrderId: order.id, shopezProductId: product.product_id } });
    await prisma.shopOrder.update({ where: { id: order.id }, data: { providerOrderId: session.session_id } });
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, provider, approvalUrl: session.checkout_url });
  }
  return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
}

async function reserveInventory(lines: CartLine[]) { await prisma.$transaction(lines.map(line => prisma.shopProductVariant.update({ where: { id: line.variantId }, data: { inventory: { decrement: Math.max(1, Math.floor(line.quantity)) } } }))); }
