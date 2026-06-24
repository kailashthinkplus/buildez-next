import { PLAN_FEATURES, PlanCode } from "./plans.constants";

/* ----------------------------------------
   TYPES
---------------------------------------- */

export type PlanUsage = {
  sitesUsed: number;
  pagesUsed: number;
  aiCreditsUsed?: number;
};

export type EnforcementResult = {
  allowed: boolean;
  reason?: string;
  limit?: number;
};

/* ----------------------------------------
   SITE LIMIT ENFORCEMENT
---------------------------------------- */

export function canCreateSite(
  plan: PlanCode,
  usage: PlanUsage
): EnforcementResult {
  const limits = PLAN_FEATURES[plan];

  if (!limits) {
    return { allowed: false, reason: "INVALID_PLAN" };
  }

  if (usage.sitesUsed >= limits.maxSites) {
    return {
      allowed: false,
      reason: "SITE_LIMIT_REACHED",
      limit: limits.maxSites,
    };
  }

  return { allowed: true };
}

/* ----------------------------------------
   PAGE LIMIT ENFORCEMENT (MODULE 3)
---------------------------------------- */

export function canCreatePage(
  plan: PlanCode,
  usage: PlanUsage
): EnforcementResult {
  const limits = PLAN_FEATURES[plan];

  if (!limits) {
    return { allowed: false, reason: "INVALID_PLAN" };
  }

  if (usage.pagesUsed >= limits.maxPages) {
    return {
      allowed: false,
      reason: "PAGE_LIMIT_REACHED",
      limit: limits.maxPages,
    };
  }

  return { allowed: true };
}

/* ----------------------------------------
   AI CREDIT ENFORCEMENT (FUTURE-SAFE)
---------------------------------------- */

export function canConsumeAiCredits(
  plan: PlanCode,
  usedCredits: number,
  requestedCredits: number
): EnforcementResult {
  const limits = PLAN_FEATURES[plan];

  if (!limits) {
    return { allowed: false, reason: "INVALID_PLAN" };
  }

  if (usedCredits + requestedCredits > limits.aiCredits) {
    return {
      allowed: false,
      reason: "AI_CREDIT_LIMIT_REACHED",
      limit: limits.aiCredits,
    };
  }

  return { allowed: true };
}

/* ----------------------------------------
   PUBLISH ENFORCEMENT (MODULE 4)
---------------------------------------- */

export function canPublishSite(plan: PlanCode): EnforcementResult {
  const limits = PLAN_FEATURES[plan];

  if (!limits) {
    return { allowed: false, reason: "INVALID_PLAN" };
  }

  if (!limits.publish) {
    return {
      allowed: false,
      reason: "PUBLISH_NOT_ALLOWED",
    };
  }

  return { allowed: true };
}


/* ----------------------------------------
   ASSERT HELPERS (PLATFORM-FACING)
---------------------------------------- */

export function assertCanCreateSite(
  plan: PlanCode,
  usage: PlanUsage
) {
  const result = canCreateSite(plan, usage);

  if (!result.allowed) {
    throw new Error(
      result.reason === "SITE_LIMIT_REACHED"
        ? `Site limit reached (${result.limit})`
        : "Site creation not allowed for current plan"
    );
  }
}
