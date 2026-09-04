import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      users,
      activeUsers,
      tenants,
      activeTenants,
      sites,
      publishedSites,
      subscriptions,
      aiTokens,
      recentUsers,
      recentTenants,
      notifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.site.count({ where: { deletedAt: null } }),
      prisma.site.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.subscription.count({ where: { status: { in: ["active", "ACTIVE"] } } }),
      prisma.aiEvent.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { tokensIn: true, tokensOut: true },
        _count: true,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      }),
      prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { sites: true, users: true } } },
      }),
      prisma.systemNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return Response.json({
      stats: {
        users,
        activeUsers,
        tenants,
        activeTenants,
        sites,
        publishedSites,
        subscriptions,
        aiRequests: aiTokens._count,
        aiTokens: (aiTokens._sum.tokensIn || 0) + (aiTokens._sum.tokensOut || 0),
      },
      recentUsers,
      recentTenants,
      notifications,
    });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
