// /apps/web-app/lib/plan/getPlan.ts

import { prisma } from "@buildez/db";

export async function getTenantPlan(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: "active" },
    include: {
      plan: true,
    },
  });

  if (!subscription) return null;

  return {
    subscription,
    plan: subscription.plan,
  };
}
