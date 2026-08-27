import { prisma } from "@buildez/db";
import type { Prisma } from "@buildez/db";

/**
 * The only relationships that grant a user access to tenant data.
 * Billing records and client supplied IDs are deliberately not authorization.
 */
export function tenantAccessWhere(userId: string): Prisma.TenantWhereInput {
  return {
    OR: [
      { ownerId: userId },
      { users: { some: { id: userId } } },
      {
        teams: {
          some: {
            members: { some: { userId } },
          },
        },
      },
    ],
  };
}

export async function findAccessibleTenant(
  userId: string,
  requestedTenantId?: string | null,
) {
  const access = tenantAccessWhere(userId);

  if (requestedTenantId) {
    const requested = await prisma.tenant.findFirst({
      where: { id: requestedTenantId, ...access },
      include: { subscription: true },
    });
    if (requested) return requested;
  }

  // A tenant owner must never be displaced by a newer team membership. This
  // precedence is also used after login, when the tenant preference cookie is
  // deliberately cleared to prevent account-switch leakage.
  const owned = await prisma.tenant.findFirst({
    where: { ownerId: userId },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    include: { subscription: true },
  });
  if (owned) return owned;

  const directlyAssigned = await prisma.tenant.findFirst({
    where: { users: { some: { id: userId } } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    include: { subscription: true },
  });
  if (directlyAssigned) return directlyAssigned;

  return prisma.tenant.findFirst({
    where: { teams: { some: { members: { some: { userId } } } } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    include: { subscription: true },
  });
}
