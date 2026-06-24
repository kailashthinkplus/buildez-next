// /apps/web-app/lib/tenant/resolveTenant.ts

import { prisma } from "@buildez/db";
import { ApiError } from "../api/errors";
import { getSessionUser } from "../auth/session";

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
  const user = await getSessionUser();
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
      if (!t) throw new ApiError(404, "TENANT_NOT_FOUND", "Invalid tenant override.");

      return { tenantId: t.id, tenant: t, user, isSuperAdmin };
    }
  }

  /* ------------------------------------------------------------
     3. TENANT COOKIE
  ------------------------------------------------------------ */
  const tenantCookie = cookies["tenantId"];
  if (tenantCookie) {
    const t = await prisma.tenant.findUnique({ where: { id: tenantCookie } });
    if (t) return { tenantId: t.id, tenant: t, user, isSuperAdmin };
  }

  /* ------------------------------------------------------------
     4. USER DEFAULT TENANT
  ------------------------------------------------------------ */
  if (user?.tenantId) {
    const t = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (t) return { tenantId: t.id, tenant: t, user, isSuperAdmin };
  }

  /* ------------------------------------------------------------
     5. FALLBACK — BODY tenantId
  ------------------------------------------------------------ */
  try {
    const body = await req.clone().json().catch(() => null);
    const bodyTenant = body?.tenantId;

    if (bodyTenant) {
      const t = await prisma.tenant.findUnique({ where: { id: bodyTenant } });
      if (t) return { tenantId: t.id, tenant: t, user, isSuperAdmin };
    }
  } catch {}

  /* ------------------------------------------------------------
     6. FAIL IF REQUIRED
  ------------------------------------------------------------ */
  if (opts.require) {
    throw new ApiError(
      400,
      "TENANT_NOT_FOUND",
      "Unable to resolve tenant context."
    );
  }

  return null;
}
