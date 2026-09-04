import { prisma } from "@buildez/db";

import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { findAccessibleTenant } from "@/lib/auth/tenantAccess";
import { AI_RATE_LIMIT_SCOPES, aiRateLimitKey, type AiRateLimitScope } from "@/lib/ai/aiRateLimit";

const SCOPE_SET = new Set(AI_RATE_LIMIT_SCOPES.map((item) => item.scope));

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    const url = new URL(req.url);
    const userId = String(url.searchParams.get("userId") || "").trim();
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const tenant = await findAccessibleTenant(userId);
    const tenantPlan = tenant ? await getTenantPlan(tenant.id) : null;
    const planLimits: Record<AiRateLimitScope, number> = {
      "agent-run": tenantPlan?.plan?.aiAgentRunLimitPerHour ?? 20,
      "agent-followup": tenantPlan?.plan?.aiAgentFollowupLimitPerHour ?? 40,
      "builder-agent": tenantPlan?.plan?.builderAgentLimitPerHour ?? 30,
    };

    const keys = AI_RATE_LIMIT_SCOPES.map((item) => aiRateLimitKey(item.scope, userId));
    const rows = await prisma.rateLimit.findMany({ where: { key: { in: keys } } });
    const rowByKey = new Map(rows.map((row) => [row.key, row]));

    const scopes = AI_RATE_LIMIT_SCOPES.map((item) => {
      const key = aiRateLimitKey(item.scope, userId);
      const row = rowByKey.get(key);
      const limit = planLimits[item.scope];
      return {
        scope: item.scope,
        label: item.label,
        limit,
        used: row?.count ?? 0,
        resetAt: row?.resetAt ?? null,
        exceeded: (row?.count ?? 0) >= limit,
      };
    });

    return Response.json({
      user,
      planCode: tenantPlan?.plan?.code || tenantPlan?.subscription?.planCode || null,
      scopes,
    });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const scope = String(body.scope || "").trim() as AiRateLimitScope;

    if (!userId || !SCOPE_SET.has(scope)) {
      return Response.json({ error: "A valid user and scope are required" }, { status: 400 });
    }

    const key = aiRateLimitKey(scope, userId);
    await prisma.rateLimit.deleteMany({ where: { key } });

    await prisma.systemNotification.create({
      data: {
        type: "SUPERADMIN_RATE_LIMIT_RESET",
        title: "Rate limit reset",
        message: `${actor.email || actor.id} reset ${scope} rate limit for user ${userId}`,
        entityType: "User",
        entityId: userId,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
