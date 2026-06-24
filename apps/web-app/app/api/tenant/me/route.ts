// /app/api/tenant/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  console.log("🚀 [tenant/me] HIT");

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    console.log("👤 [tenant/me] User:", userId);

    let tenant = null;

    /* ---------------------------------------------------------
       1) FIRST: Check if user OWNS a tenant (most common case)
       This handles both paid and trial users
    --------------------------------------------------------- */
    tenant = await prisma.tenant.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { subscription: true },
    });

    console.log("🔍 [tenant/me] Owner lookup:", tenant?.id || "NOT FOUND");

    /* ---------------------------------------------------------
       2) IF NO OWNED TENANT: Check subscription with userId
       (Paid plans create subscription with userId)
    --------------------------------------------------------- */
    if (!tenant) {
      const activeSub = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          tenantActiveId: { not: null },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tenantActive: {
            include: { subscription: true },
          },
        },
      });

      tenant = activeSub?.tenantActive || null;
      console.log("🔍 [tenant/me] Subscription lookup:", tenant?.id || "NOT FOUND");
    }

    /* ---------------------------------------------------------
       3) IF STILL NONE: Check team membership
       (User might be a team member, not owner)
    --------------------------------------------------------- */
    if (!tenant) {
      const member = await prisma.teamMember.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          team: {
            include: {
              tenant: {
                include: { subscription: true },
              },
            },
          },
        },
      });

      if (member?.team?.tenant) {
        tenant = member.team.tenant;
        console.log("🔍 [tenant/me] Team member lookup:", tenant?.id);
      }
    }

    /* ---------------------------------------------------------
       4) STILL NONE → return empty (but valid response)
    --------------------------------------------------------- */
    if (!tenant) {
      console.log("❌ [tenant/me] No tenant found for user:", userId);
      return NextResponse.json({
        data: {
          tenant: null,
          sites: [],
          teams: [],
          plan: null,
          usage: [],
          user,
        },
      });
    }

    console.log("✅ [tenant/me] Tenant found:", tenant.id);

    /* ---------------------------------------------------------
       LOAD RELATED DATA
    --------------------------------------------------------- */
    const sites = await prisma.site.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "asc" },
    });

    console.log("📄 [tenant/me] Sites:", sites.length);

    const teams = await prisma.teamMember.findMany({
      where: { userId },
      include: { team: true },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { tenantActiveId: tenant.id },
          { id: tenant.subscriptionId ?? undefined },
        ],
        status: "ACTIVE",
      },
      include: {
        Plan: true,
      },
    });

    console.log("💳 [tenant/me] Subscription:", subscription?.id || "NONE");

    const usage = await prisma.planUsage.findMany({
      where: { tenantId: tenant.id },
    });

    return NextResponse.json({
      data: {
        tenant,
        sites,
        teams,
        plan: subscription,
        usage,
        user,
      },
    });

  } catch (err: any) {
    console.error("🔥 [tenant/me] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", detail: err.message },
      { status: 500 }
    );
  }
}