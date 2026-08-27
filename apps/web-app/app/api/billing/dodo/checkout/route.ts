import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { dodoClient, dodoProductId, type BillingCycle } from "@/lib/billing/dodo";

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
  const returnPath = ["/app/onboarding", "/app/workspace/billing"].includes(requestedReturnPath)
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
  const productId = dodoProductId(planCode, billingCycle as BillingCycle);
  if (!productId) {
    return Response.json({ error: "Dodo product mapping is not configured for this plan yet." }, { status: 503 });
  }
  try {
    const client = dodoClient();
    const configuredReturn = process.env.DODO_PAYMENTS_RETURN_URL;
    const returnBase = returnPath === "/app/workspace/billing" && configuredReturn
      ? configuredReturn
      : `${req.nextUrl.origin}${returnPath}`;
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
    return Response.json({ error: error instanceof Error ? error.message : "Dodo checkout could not be started." }, { status: 502 });
  }
}
