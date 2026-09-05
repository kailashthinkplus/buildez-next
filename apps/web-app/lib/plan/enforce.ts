// /apps/web-app/lib/plan/enforce.ts

import { PlanError } from "../api/errors";
import { getTenantPlan } from "./getPlan";
import { getTenantUsage } from "./getUsage";
import { computeTrialStatus, assertTrialNotExpired } from "./trial";
import { prisma } from "@buildez/db";

/* ============================================================
   ENFORCE SITE LIMIT
============================================================ */
export async function enforceSiteLimit(tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  if (!planData) return; // free-tier? unlimited or restricted elsewhere

  const { plan, subscription } = planData;
  assertTrialNotExpired(computeTrialStatus(plan, subscription));

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

  const { plan, subscription } = planData;
  assertTrialNotExpired(computeTrialStatus(plan, subscription));

  const pageCount = await prisma.page.count({
    where: { siteId },
  });

  if (pageCount >= plan.maxPages) {
    throw new PlanError("You have reached the maximum number of pages for your plan.");
  }
}
