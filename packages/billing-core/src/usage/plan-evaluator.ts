import { PLAN_FEATURES, PlanCode } from "../plans/plans.constants";

type Usage = {
  sites: number;
  pages: number;
  aiCreditsUsed: number;
};

export function evaluatePlanUsage(plan: PlanCode, usage: Usage) {
  const limits = PLAN_FEATURES[plan];

  const siteLimitReached = usage.sites >= limits.maxSites;

  return {
    plan,
    usage,
    limits,

    flags: {
      siteLimitReached,
      canCreateSite: !siteLimitReached,
      canPublish: limits.publish,
      upgradeRequired: siteLimitReached,
    },
  };
}
