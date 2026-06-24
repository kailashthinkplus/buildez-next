import { PLAN_FEATURES } from "../plans/plans.constants";
export function evaluatePlanUsage(plan, usage) {
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
