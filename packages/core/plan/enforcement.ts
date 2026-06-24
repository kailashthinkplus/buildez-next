import { prisma } from "@buildez/db";
import {
  PLAN_FEATURES,
  PlanCode,
} from "@buildez/billing-core/src/plans/plans.constants";

/* =========================================================
   TYPES
========================================================= */

export type PlanContext = {
  planCode: PlanCode;
  features: (typeof PLAN_FEATURES)[PlanCode];
  usage: {
    sites: number;
    pages: number;
    aiCreditsUsed: number;
    teamMembers: number;
  };
};

/* =========================================================
   LOAD PLAN CONTEXT
========================================================= */

export async function getPlanContext(
  tenantId: string
): Promise<PlanContext> {
  /* ----------------------------------
     ACTIVE SUBSCRIPTION
  ---------------------------------- */
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: "ACTIVE", // TRIAL can be added later
    },
  });

  if (!subscription) {
    throw new Error("NO_ACTIVE_SUBSCRIPTION");
  }

  const planCode = subscription.planCode as PlanCode;
  const features = PLAN_FEATURES[planCode];

  if (!features) {
    throw new Error("PLAN_FEATURES_NOT_DEFINED");
  }

  /* ----------------------------------
     USAGE COUNTS
  ---------------------------------- */
  const [sites, pages, teamMembers, aiUsage] = await Promise.all([
    db.site.count({ where: { tenantId } }),
    db.page.count({ where: { tenantId } }),
    db.user.count({
      where: {
        tenantId,
        role: "MEMBER",
      },
    }),
    db.aiUsage.aggregate({
      where: { tenantId },
      _sum: { credits: true },
    }),
  ]);

  return {
    planCode,
    features,
    usage: {
      sites,
      pages,
      teamMembers,
      aiCreditsUsed: aiUsage._sum.credits ?? 0,
    },
  };
}

/* =========================================================
   ENFORCEMENT GUARDS
========================================================= */

export function assertCanCreateSite(ctx: PlanContext) {
  if (ctx.usage.sites >= ctx.features.maxSites) {
    throw new Error("PLAN_LIMIT_SITES_EXCEEDED");
  }
}

export function assertCanCreatePage(ctx: PlanContext) {
  if (ctx.usage.pages >= ctx.features.maxPages) {
    throw new Error("PLAN_LIMIT_PAGES_EXCEEDED");
  }
}

export function assertCanUseAI(
  ctx: PlanContext,
  creditsToConsume: number
) {
  if (
    ctx.usage.aiCreditsUsed + creditsToConsume >
    ctx.features.aiCredits
  ) {
    throw new Error("PLAN_LIMIT_AI_EXCEEDED");
  }
}

export function assertCanAddTeamMember(ctx: PlanContext) {
  if (ctx.usage.teamMembers >= ctx.features.teamMembers) {
    throw new Error("PLAN_LIMIT_TEAM_EXCEEDED");
  }
}

export function assertCanPublish(ctx: PlanContext) {
  if (!ctx.features.publish) {
    throw new Error("PLAN_FEATURE_PUBLISH_DISABLED");
  }
}
