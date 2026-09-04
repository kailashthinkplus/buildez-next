// /apps/web-app/lib/ai/usage.ts

import { prisma } from "@buildez/db";
import { ApiError } from "../api/errors";

export interface AiUsageParams {
  tenantId: string;
  userId?: string;
  siteId?: string;
  pageId?: string;

  model: string;
  tokensIn: number;
  tokensOut: number;

  action: string; // "generate_hero", "rewrite_section", etc.
  prompt: string;
  response?: string;
}

/* ============================================================
   1. GET TENANT AI PLAN LIMITS
============================================================ */
async function getTenantAiLimits(tenantId: string) {
  const sub = await prisma.subscription.findFirst({
    where: {
      OR: [{ tenantActiveId: tenantId }, { tenantHistoryId: tenantId }],
      status: "ACTIVE",
    },
  });

  if (!sub) {
    throw new ApiError(
      "You must subscribe to a plan before using AI features.",
      403,
      "NO_ACTIVE_PLAN"
    );
  }

  const plan = sub.planCode
    ? await prisma.plan.findUnique({ where: { code: sub.planCode } })
    : null;
  if (!plan) throw new ApiError("The active subscription plan is unavailable.", 403, "PLAN_NOT_FOUND");

  return { plan, aiLimit: plan.aiCredits };
}

/* ============================================================
   2. TRACK USAGE (PlanUsage)
============================================================ */
async function getCurrentUsage(tenantId: string) {
  let usage = await prisma.planUsage.findFirst({
    where: { tenantId, key: "ai_credits" },
    orderBy: { periodStart: "desc" },
  });

  if (!usage) {
    usage = await prisma.planUsage.create({
      data: {
        tenantId,
        key: "ai_credits",
        used: 0,
      },
    });
  }

  return usage;
}

/* ============================================================
   3. LOG AI EVENT (Audit + Analytics)
============================================================ */
async function logAiEvent({
  tenantId,
  userId,
  siteId,
  pageId,
  model,
  tokensIn,
  tokensOut,
  action,
  prompt,
  response,
}: AiUsageParams) {
  return prisma.aiEvent.create({
    data: {
      tenantId,
      userId,
      siteId,
      pageId,
      action,
      prompt,
      response,
      model,
      tokensIn,
      tokensOut,
      status: "success",
    },
  });
}

/* ============================================================
   4. APPLY AI USAGE (billing-style)
============================================================ */
export async function consumeAiCredits(params: AiUsageParams) {
  const { tenantId, tokensIn, tokensOut } = params;
  const totalTokens = tokensIn + tokensOut;

  // 1) Load plan
  const { aiLimit } = await getTenantAiLimits(tenantId);

  // 2) Load current usage
  const usage = await getCurrentUsage(tenantId);

  // 3) Enforce limit
  if (usage.used + totalTokens > aiLimit) {
    throw new ApiError(
      "You have reached your monthly AI usage limit.",
      429,
      "AI_CREDITS_EXCEEDED"
    );
  }

  // 4) LOG the event
  await logAiEvent(params);

  // 5) Update usage
  await prisma.planUsage.update({
    where: { id: usage.id },
    data: {
      used: usage.used + totalTokens,
    },
  });

  return {
    success: true,
    used: totalTokens,
    totalUsed: usage.used + totalTokens,
    limit: aiLimit,
    remaining: aiLimit - (usage.used + totalTokens),
  };
}
