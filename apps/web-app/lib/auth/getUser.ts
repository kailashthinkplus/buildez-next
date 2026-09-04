import { prisma } from "@buildez/db";
import { getCurrentUser } from "./session";
import { cookies } from "next/headers";
import { findAccessibleTenant } from "./tenantAccess";

export interface AuthContext {
  user: any;
  tenant: any | null;
  team: any | null;
  role: string | null;
  permissions: Record<string, boolean>;
  plan: any | null;
  usage: any | null;

  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

/**
 * MUST match the logic of /api/tenant/me
 * because that endpoint is the source of truth.
 *
 * This loads:
 * - user
 * - active tenant (owner or team member)
 * - team membership (role)
 * - plan + usage
 * - permission matrix
 */
export async function getUser(): Promise<AuthContext | null> {
  const user = await getCurrentUser();

  if (!user) return null;

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  /* ------------------------------------------------------------------
     1) Resolve tenant ID (from cookie or header)
  ------------------------------------------------------------------ */
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("tenant-user-id")?.value === user.id
    ? cookieStore.get("tenant-id")?.value || null
    : null;

  const tenant = await findAccessibleTenant(user.id, tenantId);

  /* ------------------------------------------------------------------
     2) Team membership (for this tenant)
  ------------------------------------------------------------------ */
  let team = null;
  let teamRole: string | null = null;

  if (tenant && !isSuperAdmin) {
    team = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: {
          tenantId: tenant.id,
        },
      },
      include: { team: true },
    });

    teamRole = team?.role || null;
  }

  /* ------------------------------------------------------------------
     3) Role flags
  ------------------------------------------------------------------ */
  const isTenantAdmin =
    isSuperAdmin ||
    teamRole === "OWNER" ||
    teamRole === "ADMIN" ||
    (tenant && tenant.ownerId === user.id);

  const isEditor = isTenantAdmin || teamRole === "EDITOR";
  const isViewer = !isEditor && teamRole === "VIEWER";

  /* ------------------------------------------------------------------
     4) Plan + usage (tenant required)
  ------------------------------------------------------------------ */
  let plan = null;
  let usage = null;

  if (tenant && !isSuperAdmin) {
    plan = await prisma.subscription.findFirst({
      where: {
        tenantActiveId: tenant.id,
        status: "ACTIVE",
      },
      include: { Plan: true },
    });

    // Free/trial subscriptions are created with only `planCode` set (no
    // `planId` FK — see /api/onboarding/finish and create-tenant), so the
    // `Plan` relation above comes back null for them even though the plan
    // itself exists. Falling back to a planCode lookup keeps every existing
    // `auth.plan.Plan` consumer working without needing a data migration.
    if (plan && !plan.Plan && plan.planCode) {
      plan.Plan = await prisma.plan.findUnique({ where: { code: plan.planCode } });
    }

    usage = await prisma.planUsage.findMany({
      where: { tenantId: tenant.id },
    });
  }

  /* ------------------------------------------------------------------
     5) Permission matrix
  ------------------------------------------------------------------ */
  const permissions = {
    manageEverything: isSuperAdmin,
    manageTenant: isTenantAdmin,
    manageTeam: isTenantAdmin,
    manageBilling: isTenantAdmin,

    editBlueprint: isEditor,
    useAI: isEditor,
    publishSite: isTenantAdmin,

    createPage: isEditor,
    editPage: isEditor,
    deletePage: isTenantAdmin,

    createSite: isTenantAdmin,
    deleteSite: isTenantAdmin,
    renameSite: isEditor,

    viewOnly: isViewer,
  };

  return {
    user,
    tenant,
    team,
    role: teamRole ?? user.role,
    permissions,
    plan,
    usage,

    isSuperAdmin,
    isTenantAdmin,
    isEditor,
    isViewer,
  };
}
