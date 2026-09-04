import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import Stripe from "stripe";
import { decryptSecret, markShopOrderPaid } from "@/lib/shopez";

export const runtime = "nodejs";

/** Durable confirmation path for Stripe orders: the client also confirms via
 * /api/public/shopez/payments/verify right after the checkout redirect, but a
 * customer who closes the tab before that call fires would otherwise leave
 * the order stuck PENDING forever — this webhook is the source of truth. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  const integration = await prisma.shopPaymentIntegration.findUnique({ where: { shopId_provider: { shopId, provider: "STRIPE" } } });
  if (!integration?.webhookSecret || !integration.encryptedSecret) return NextResponse.json({ error: "Not configured" }, { status: 404 });
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const stripe = new Stripe(decryptSecret(integration.encryptedSecret));
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, decryptSecret(integration.webhookSecret));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.shopezOrderId;
    if (orderId && session.payment_status === "paid") {
      const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      await markShopOrderPaid(orderId, paymentId);
    }
  }
  return NextResponse.json({ received: true });
}
