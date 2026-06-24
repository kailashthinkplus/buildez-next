// /apps/web-app/lib/auth/verifyTenant.ts

import { prisma } from "@buildez/db";
import { getCurrentUser } from "./session";
import { NextRequest } from "next/server";

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
export async function verifyTenantAccess(req: NextRequest) {
  try {
    // 1) Authenticated user
    const user = await getCurrentUser(req);
    if (!user) return null;

    // 2) Read tenant ID from header or cookie
    const tenantId =
      req.headers.get("x-tenant-id") ||
      req.cookies.get("tenant-id")?.value;

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
