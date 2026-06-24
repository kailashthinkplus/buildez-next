import { prisma } from "@buildez/db";

export async function getTenantUsage(tenantId: string) {
  const [siteCount] = await Promise.all([
    db.site.count({
      where: {
        tenantId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    sites: siteCount,
    pages: 0,        // future
    aiCreditsUsed: 0 // future
  };
}
