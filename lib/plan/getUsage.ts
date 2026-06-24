// /apps/web-app/lib/plan/getUsage.ts

import { prisma } from "@buildez/db";

export async function getTenantUsage(tenantId: string) {
  const usage = await prisma.planUsage.findFirst({
    where: { tenantId },
  });

  if (!usage) {
    // create first-time usage record
    return await prisma.planUsage.create({
      data: {
        tenantId,
        aiCreditsUsed: 0,
        sitesUsed: 0,
      },
    });
  }

  return usage;
}
