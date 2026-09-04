import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { getCurrentUser } from "@/lib/auth/session";
import { validateCoupon } from "@/lib/billing/coupons";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Onboarding hasn't created a tenant yet for a free/trial pick, so this
  // must work off just the session user rather than requiring auth.tenant
  // the way the checkout route does.
  const auth = await getUser().catch(() => null);
  const user = auth?.user || (await getCurrentUser(req));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code : "";
  const planCode = typeof body.planCode === "string" ? body.planCode.toUpperCase() : "";
  const billingCycle = body.billingCycle === "yearly" ? "yearly" : "monthly";

  if (!planCode) return Response.json({ error: "Choose a plan first." }, { status: 400 });

  const plan = await prisma.plan.findFirst({
    where: { code: planCode, isPublic: true },
    include: { pricing: { where: { billingCycle, isActive: true }, take: 1 } },
  });
  const pricing = plan?.pricing[0];
  if (!plan || !pricing) return Response.json({ error: "This plan is unavailable." }, { status: 404 });

  const result = await validateCoupon({
    code,
    userId: user.id,
    planCode,
    billingCycle,
    amount: pricing.amount,
    currency: pricing.currency,
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({
    valid: true,
    code: result.code,
    type: result.type,
    description: result.description,
    originalAmount: pricing.amount,
    discountAmount: result.discountAmount,
    finalAmount: result.finalAmount,
    currency: pricing.currency,
  });
}
