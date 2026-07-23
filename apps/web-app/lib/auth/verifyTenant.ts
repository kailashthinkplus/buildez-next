// /apps/web-app/lib/auth/verifyTenant.ts

import { prisma } from "@buildez/db";
import { getCurrentUser } from "./session";

/**
 * verifyTenantAccess(req)
 *
 * Reads tenantId from:
 * - x-tenant-id header
 * - tenant-id cookie
 *
 * Ensures:
 * - user owns tenant  OR
 * - user is a team member of tenant
 */
export async function verifyTenantAccess(req: Request) {
  try {
    // 1) Authenticated user
    const user = await getCurrentUser(req);
    if (!user) return null;

    // 2) Read tenant ID from header or cookie
    const cookieTenantId = req.headers.get("cookie")
      ?.split(";")
      .map((item) => item.trim().split("="))
      .find(([name]) => name === "tenant-id")?.[1];
    const tenantId = req.headers.get("x-tenant-id") || cookieTenantId;

    if (!tenantId) return null;

    // 3) Validate tenant belongs to this user
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        OR: [
          // Case A: user owns tenant
          { ownerId: user.id },

          // Case B: user is team member of tenant
          {
            teams: {
              some: {
                members: {
                  some: { userId: user.id },
                },
              },
            },
          },
        ],
      },
      include: {
        subscription: true,
      },
    });

    return tenant || null;
  } catch (err) {
    console.error("verifyTenantAccess ERROR:", err);
    return null;
  }
}
