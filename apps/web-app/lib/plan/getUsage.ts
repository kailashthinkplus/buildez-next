// /apps/web-app/lib/plan/getUsage.ts

import { prisma } from "@buildez/db";

export async function getTenantUsage(tenantId: string) {
  const [sitesUsed, aiUsage] = await Promise.all([
    prisma.site.count({ where: { tenantId, deletedAt: null } }),
    prisma.planUsage.findFirst({
      where: { tenantId, key: "ai_credits" },
      orderBy: { periodStart: "desc" },
    }),
  ]);

  return { sitesUsed, aiCreditsUsed: aiUsage?.used ?? 0 };
}
