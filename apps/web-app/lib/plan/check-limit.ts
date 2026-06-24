// /Users/kailash/buildez/apps/web-app/lib/plan/check-limit.ts

import { prisma } from "@buildez/db";
import { ApiError } from "@/lib/api/apiHandler";

/**
 * checkPlanLimit
 * 
 * Ensures the current tenant is allowed to create more items of a certain type.
 * Example types: "pages", "sites", "forms", "domains"
 */
export async function checkPlanLimit(
  tenantId: string,
  type: "pages" | "sites" | "blueprints" | string
) {
  // 1. Load current tenant plan
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { planId: true },
  });

  if (!tenant) throw new ApiError("NOT_FOUND", "Tenant not found");

  const plan = await prisma.plan.findUnique({
    where: { id: tenant.planId || "" },
    select: {
      limits: true, // JSON structure containing { pages: X, sites: X, ... }
    },
  });

  if (!plan) {
    // If no plan is set, treat as unlimited
    return true;
  }

  const maxAllowed = plan.limits?.[type];

  // Unlimited case
  if (!maxAllowed || maxAllowed === -1) return true;

  // 2. Count usage depending on type
  let currentCount = 0;

  if (type === "pages") {
    currentCount = await prisma.page.count({ where: { tenantId } });
  }

  if (type === "sites") {
    currentCount = await prisma.site.count({ where: { tenantId } });
  }

  if (type === "blueprints") {
    currentCount = await prisma.blueprint.count({ where: { tenantId } });
  }

  // 3. Compare against plan limit
  return currentCount < maxAllowed;
}
