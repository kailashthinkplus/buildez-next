// /apps/web-app/lib/auth/verifyTenant.ts

import { getCurrentUser } from "./session";
import { findAccessibleTenant } from "./tenantAccess";

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
    const requestCookies = new Map(
      (req.headers.get("cookie") || "").split(";").flatMap((item) => {
        const separator = item.indexOf("=");
        return separator < 0 ? [] : [[item.slice(0, separator).trim(), item.slice(separator + 1).trim()] as const];
      }),
    );
    const tenantId = requestCookies.get("tenant-user-id") === user.id
      ? requestCookies.get("tenant-id")
      : undefined;

    // 3) Validate tenant belongs to this user
    const tenant = await findAccessibleTenant(user.id, tenantId);

    return tenant || null;
  } catch (err) {
    console.error("verifyTenantAccess ERROR:", err);
    return null;
  }
}
