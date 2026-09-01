import { NextRequest } from "next/server";
import { ConflictError } from "dodopayments";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { dodoClient, resolveDodoProductId, type BillingCycle } from "@/lib/billing/dodo";

const RESUMABLE_PAYMENT_STATUSES = new Set([
  "processing",
  "requires_customer_action",
  "requires_confirmation",
  "requires_payment_method",
  "requires_capture",
]);

/**
 * Dodo rejects a second `changePlan` call with 409 while an earlier plan
 * change's payment is still unresolved. Rather than dead-ending the user,
 * look up that in-flight payment and hand back its existing payment link so
 * they can finish (or retry) the same charge instead of getting stuck.
 */
async function findResumablePlanChangePaymentLink(
  client: ReturnType<typeof dodoClient>,
  subscriptionId: string,
) {
  const page = await client.payments.list({ subscription_id: subscriptionId, page_size: 20 });
  const pending = page.items
    .filter((payment) => RESUMABLE_PAYMENT_STATUSES.has(payment.status || ""))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  if (!pending) return undefined;
  const full = await client.payments.retrieve(pending.payment_id);
  return full.payment_link || undefined;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant || !auth.permissions.manageBilling) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const planCode = typeof body.planCode === "string" ? body.planCode.toUpperCase() : "";
  const billingCycle = body.billingCycle === "yearly" ? "yearly" : body.billingCycle === "monthly" ? "monthly" : "";
  const requestedReturnPath = typeof body.returnPath === "string" ? body.returnPath : "";
  const returnPath = ["/app/onboarding", "/app/plans", "/app/workspace/billing"].includes(requestedReturnPath)
    ? requestedReturnPath
    : "/app/workspace/billing";
  if (!planCode || !billingCycle) {
    return Response.json({ error: "Choose a plan and billing cycle." }, { status: 400 });
  }
  if (!auth.user.email) {
    return Response.json({ error: "Add an email address before starting checkout." }, { status: 400 });
  }
  const plan = await prisma.plan.findFirst({
    where: { code: planCode, isPublic: true },
    include: { pricing: { where: { billingCycle, isActive: true }, take: 1 } },
  });
  const pricing = plan?.pricing[0];
  if (!plan || !pricing) return Response.json({ error: "This plan is unavailable." }, { status: 404 });
  const currentPlan = auth.plan?.Plan;
  if (currentPlan && plan.maxSites <= currentPlan.maxSites && plan.maxPages <= currentPlan.maxPages && plan.aiCredits <= currentPlan.aiCredits && plan.teamMembers <= currentPlan.teamMembers) {
    return Response.json({ error: "Choose a plan above your current plan." }, { status: 400 });
  }
  const productId = await resolveDodoProductId(planCode, billingCycle as BillingCycle);
  if (!productId) {
    return Response.json({ error: "This plan is currently unavailable for online payment." }, { status: 503 });
  }
  try {
    const client = dodoClient();
    const configuredReturn = process.env.DODO_PAYMENTS_RETURN_URL;
    const returnBase = returnPath === "/app/workspace/billing" && configuredReturn
      ? configuredReturn
      : `${req.nextUrl.origin}${returnPath}`;
    if (typeof auth.plan?.dodoSubscriptionId === "string" && auth.plan.dodoSubscriptionId) {
      const dodoSubscriptionId = auth.plan.dodoSubscriptionId;
      try {
        const changed = await client.subscriptions.changePlan(dodoSubscriptionId, {
          product_id: productId,
          quantity: 1,
          proration_billing_mode: "prorated_immediately",
          on_payment_failure: "prevent_change",
          metadata: {
            tenantId: auth.tenant.id,
            userId: auth.user.id,
            planCode,
            billingCycle,
          },
        });
        return Response.json({
          checkoutUrl: changed.payment_link || `${returnBase}${returnBase.includes("?") ? "&" : "?"}planChange=processing`,
          planChange: true,
        });
      } catch (error) {
        if (!(error instanceof ConflictError)) throw error;
        // A previous plan-change payment is still unresolved. Hand the
        // customer back to that same payment instead of failing outright.
        const resumeUrl = await findResumablePlanChangePaymentLink(client, dodoSubscriptionId);
        if (resumeUrl) {
          return Response.json({ checkoutUrl: resumeUrl, planChange: true, resumed: true });
        }
        return Response.json({
          error: "A plan change is already in progress for your subscription. Please wait a few minutes for the current payment to complete, then try again.",
        }, { status: 409 });
      }
    }
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: auth.user.email, ...(auth.user.name ? { name: auth.user.name } : {}) },
      metadata: {
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        planCode,
        billingCycle,
      },
      return_url: `${returnBase}${returnBase.includes("?") ? "&" : "?"}checkout=success`,
      cancel_url: `${req.nextUrl.origin}${returnPath}?checkout=cancelled`,
      feature_flags: { redirect_immediately: true },
    });
    if (!session.checkout_url) throw new Error("Dodo Payments returned no checkout URL.");
    await prisma.subscription.create({
      data: {
        tenantHistoryId: auth.tenant.id,
        userId: auth.user.id,
        planCode,
        planId: plan.id,
        billingCycle,
        status: "PENDING",
        paymentStatus: "PENDING",
        amountPaid: pricing.amount,
        currency: pricing.currency,
        dodoCheckoutSessionId: session.session_id,
      },
    });
    return Response.json({ checkoutUrl: session.checkout_url });
  } catch (error) {
    console.error("Subscription checkout failed:", error);
    return Response.json({ error: "Checkout could not be started. Please try again." }, { status: 502 });
  }
}
