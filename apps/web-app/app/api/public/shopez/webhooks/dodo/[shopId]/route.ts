import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyWebhookPayload } from "@dodopayments/core/webhook";
import { decryptSecret, markShopOrderPaid } from "@/lib/shopez";

export const runtime = "nodejs";

/** Durable confirmation path for Dodo orders — see the Stripe webhook route
 * for why this exists alongside the client-driven verify call. Each shop's
 * Dodo dashboard is configured to POST here with its own webhook secret, so
 * (unlike @dodopayments/nextjs's `Webhooks()` helper, which binds one fixed
 * key at module load) verification has to happen per-request against the
 * shop's own decrypted secret. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  const integration = await prisma.shopPaymentIntegration.findUnique({ where: { shopId_provider: { shopId, provider: "DODO" } } });
  if (!integration?.webhookSecret) return NextResponse.json({ error: "Not configured" }, { status: 404 });
  const body = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  let payload: Awaited<ReturnType<typeof verifyWebhookPayload>>;
  try {
    payload = await verifyWebhookPayload({ webhookKey: decryptSecret(integration.webhookSecret), headers, body });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (payload.type === "payment.succeeded") {
    const orderId = payload.data.metadata?.shopezOrderId as string | undefined;
    if (orderId) await markShopOrderPaid(orderId, payload.data.payment_id);
  }
  return NextResponse.json({ received: true });
}
