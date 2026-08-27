// /apps/web-app/lib/tenant/resolveTenant.ts

import { prisma } from "@buildez/db";
import { ApiError } from "../api/errors";
import { getSessionUser } from "../auth/session";
import { findAccessibleTenant } from "../auth/tenantAccess";

interface TenantResolveOptions {
  require?: boolean; // throw error if missing
  allowSuperAdminOverride?: boolean;
}

export interface TenantContext {
  tenantId: string;
  tenant: any;
  user: any | null;
  isSuperAdmin: boolean;
}

/* ============================================================
   RESOLVE TENANT CONTEXT
============================================================ */
export async function resolveTenant(
  req: Request,
  opts: TenantResolveOptions = { require: true }
): Promise<TenantContext | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((x) => x.trim().split("="))
  );

  /* ------------------------------------------------------------
     1. Get user session
  ------------------------------------------------------------ */
  const user = await getSessionUser(req);
  if (!user) {
    if (opts.require) throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
    return null;
  }
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  /* ------------------------------------------------------------
     2. SUPER ADMIN OVERRIDE (optional)
  ------------------------------------------------------------ */
  if (opts.allowSuperAdminOverride && isSuperAdmin) {
    const override =
      req.headers.get("x-tenant-id") ||
      new URL(req.url).searchParams.get("tenantId");

    if (override) {
      const t = await prisma.tenant.findUnique({ where: { id: override } });
      if (!t) throw new ApiError("Invalid tenant override.", 404, "TENANT_NOT_FOUND");

      return { tenantId: t.id, tenant: t, user, isSuperAdmin };
    }
  }

  /* ------------------------------------------------------------
     3. TENANT COOKIE
  ------------------------------------------------------------ */
  const tenantCookie = cookies["tenant-user-id"] === user.id
    ? cookies["tenant-id"]
    : undefined;
  const accessibleTenant = await findAccessibleTenant(user.id, tenantCookie);
  if (accessibleTenant) {
    return {
      tenantId: accessibleTenant.id,
      tenant: accessibleTenant,
      user,
      isSuperAdmin,
    };
  }

  /* ------------------------------------------------------------
     4. USER DEFAULT TENANT
  ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     4. FAIL IF REQUIRED
  ------------------------------------------------------------ */
  if (opts.require) {
    throw new ApiError(
      "Unable to resolve tenant context.",
      400,
      "TENANT_NOT_FOUND"
    );
  }

  return null;
}
