import { prisma } from "@buildez/db";

import {
  requireSuperAdmin,
  superAdminErrorResponse,
} from "@/lib/superadmin/auth";

import {
  resolveV12ExecutionPolicy,
} from "@/modules/ai-v12/executionPolicy";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);

    const url = new URL(req.url);
    const code = String(
      url.searchParams.get("code") || "",
    )
      .trim()
      .toUpperCase();

    if (!code) {
      return Response.json(
        { error: "Plan code is required" },
        { status: 400 },
      );
    }

    const plan =
      await prisma.plan.findUnique({
        where: {
          code,
        },
        include: {
          features: true,
        },
      });

    if (!plan) {
      return Response.json(
        { error: "Plan not found" },
        { status: 404 },
      );
    }

    const policy =
      resolveV12ExecutionPolicy(
        plan.code,
        plan.features,
      );

    return Response.json({
      plan: {
        code: plan.code,
        name: plan.name,
        aiCredits: plan.aiCredits,
      },

      policy,
    });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
