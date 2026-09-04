// /apps/web-app/lib/plan/getPlan.ts

import { prisma } from "@buildez/db";

export async function getTenantPlan(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantActiveId: tenantId, status: "ACTIVE" },
  });

  if (!subscription) return null;

  const plan = subscription.planCode
    ? await prisma.plan.findUnique({
        where: { code: subscription.planCode },
        include: {
          features: true,
        },
      })
    : null;
  if (!plan) return null;

  return { subscription, plan };
}
