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
      tenantId,
      status: "active",
    },
    include: {
      plan: true,
    },
  });

  if (!sub) {
    throw new ApiError(
      403,
      "NO_ACTIVE_PLAN",
      "You must subscribe to a plan before using AI features."
    );
  }

  return {
    plan: sub.plan,
    aiLimit: sub.plan.aiCredits,
  };
}

/* ============================================================
   2. TRACK USAGE (PlanUsage)
============================================================ */
async function getCurrentUsage(tenantId: string) {
  let usage = await prisma.planUsage.findUnique({
    where: { tenantId },
  });

  if (!usage) {
    usage = await prisma.planUsage.create({
      data: {
        tenantId,
        aiUsed: 0,
        sitesUsed: 0,
        pagesUsed: 0,
        bandwidthUsed: 0,
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
  if (usage.aiUsed + totalTokens > aiLimit) {
    throw new ApiError(
      429,
      "AI_CREDITS_EXCEEDED",
      "You have reached your monthly AI usage limit."
    );
  }

  // 4) LOG the event
  await logAiEvent(params);

  // 5) Update usage
  await prisma.planUsage.update({
    where: { tenantId },
    data: {
      aiUsed: usage.aiUsed + totalTokens,
    },
  });

  return {
    success: true,
    used: totalTokens,
    totalUsed: usage.aiUsed + totalTokens,
    limit: aiLimit,
    remaining: aiLimit - (usage.aiUsed + totalTokens),
  };
}
