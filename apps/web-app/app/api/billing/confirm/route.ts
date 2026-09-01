import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import {
  dodoClient,
  recordDodoSubscriptionPayment,
  resolveDodoPlanForProduct,
  syncDodoSubscription,
} from "@/lib/billing/dodo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const expectedPlanCode = typeof body.planCode === "string"
    ? body.planCode.trim().toUpperCase()
    : "";

  if (!expectedPlanCode) {
    return Response.json({ error: "Plan is required." }, { status: 400 });
  }

  try {
    const pending = await prisma.subscription.findFirst({
      where: {
        tenantHistoryId: auth.tenant.id,
        userId: auth.user.id,
        planCode: expectedPlanCode,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    let externalSubscriptionId = pending?.dodoSubscriptionId || undefined;
    const client = dodoClient();

    if (pending?.dodoCheckoutSessionId) {
      const session = await client.checkoutSessions.retrieve(pending.dodoCheckoutSessionId);
      if (session.payment_status !== "succeeded" || !session.payment_id) {
        return Response.json({ activated: false, status: session.payment_status || "processing" });
      }
      const payment = await client.payments.retrieve(session.payment_id);
      externalSubscriptionId = payment.subscription_id || undefined;
      await recordDodoSubscriptionPayment({
        type: "payment.succeeded",
        timestamp: new Date().toISOString(),
        data: { ...payment, payload_type: "Payment" },
      });
    }

    if (!externalSubscriptionId) {
      const active = await prisma.subscription.findFirst({
        where: {
          tenantActiveId: auth.tenant.id,
          dodoSubscriptionId: { not: null },
        },
        select: { dodoSubscriptionId: true },
      });
      externalSubscriptionId = active?.dodoSubscriptionId || undefined;
    }

    if (!externalSubscriptionId) {
      return Response.json({ activated: false, status: "processing" });
    }

    const remote = await client.subscriptions.retrieve(externalSubscriptionId);
    const configuredPlan = await resolveDodoPlanForProduct(remote.product_id);
    const metadata = remote.metadata as Record<string, unknown>;
    const ownsSubscription = metadata.tenantId === auth.tenant.id && metadata.userId === auth.user.id;

    if (!configuredPlan || configuredPlan.planCode !== expectedPlanCode || !ownsSubscription) {
      return Response.json({ error: "Subscription verification failed." }, { status: 409 });
    }

    await syncDodoSubscription({
      type: remote.status === "active" ? "subscription.active" : "subscription.updated",
      timestamp: new Date().toISOString(),
      data: { ...remote, payload_type: "Subscription" },
    });

    return Response.json({
      activated: remote.status === "active",
      status: remote.status,
      planCode: configuredPlan.planCode,
    });
  } catch (error) {
    console.error("Subscription confirmation failed:", error);
    return Response.json({ activated: false, status: "processing" });
  }
}
