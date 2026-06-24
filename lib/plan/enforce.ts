// /apps/web-app/lib/plan/enforce.ts

import { PlanError } from "../api/errors";
import { getTenantPlan } from "./getPlan";
import { getTenantUsage } from "./getUsage";
import { prisma } from "@buildez/db";

/* ============================================================
   ENFORCE SITE LIMIT
============================================================ */
export async function enforceSiteLimit(tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  if (!planData) return; // free-tier? unlimited or restricted elsewhere

  const { plan } = planData;
  const usage = await getTenantUsage(tenantId);

  if (usage.sitesUsed >= plan.maxSites) {
    throw new PlanError("You have reached the maximum number of sites.");
  }
}

/* ============================================================
   ENFORCE PAGE LIMIT
============================================================ */
export async function enforcePageLimit(siteId: string, tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  if (!planData) return;

  const { plan } = planData;

  const pageCount = await prisma.page.count({
    where: { siteId },
  });

  if (pageCount >= plan.maxPages) {
    throw new PlanError("You have reached the maximum number of pages for your plan.");
  }
}

/* ============================================================
   ENFORCE TEAM MEMBER LIMIT
============================================================ */
export async function enforceTeamLimit(tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  if (!planData) return;

  const { plan } = planData;

  const teamData = await prisma.team.count({
    where: { tenantId },
  });

  if (teamData >= plan.teamMembers) {
    throw new PlanError("Team member limit exceeded for this plan.");
  }
}

/* ============================================================
   ENFORCE AI CREDITS
============================================================ */
export async function enforceAICredits(tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  if (!planData) return;

  const { plan } = planData;
  const usage = await getTenantUsage(tenantId);

  if (plan.aiCredits != null && usage.aiCreditsUsed >= plan.aiCredits) {
    throw new PlanError("AI credits exhausted for this billing cycle.");
  }
}

/* ============================================================
   INCREMENT AI CREDIT USAGE
============================================================ */
export async function incrementAICredits(tenantId: string, tokensUsed = 1000) {
  await prisma.planUsage.updateMany({
    where: { tenantId },
    data: {
      aiCreditsUsed: { increment: 1 },
      aiTokensUsed: { increment: tokensUsed },
    },
  });
}

/* ============================================================
   INCREMENT SITE COUNT
============================================================ */
export async function incrementSiteCount(tenantId: string) {
  await prisma.planUsage.updateMany({
    where: { tenantId },
    data: { sitesUsed: { increment: 1 } },
  });
}
