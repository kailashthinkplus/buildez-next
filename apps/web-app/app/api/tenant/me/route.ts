// /app/api/tenant/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { findAccessibleTenant } from "@/lib/auth/tenantAccess";
import { persistGoogleAvatarForTenant } from "@/lib/auth/googleAvatar";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

export async function GET(req: NextRequest) {
  console.log("🚀 [tenant/me] HIT");

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const userId = user.id;
    console.log("👤 [tenant/me] User:", userId);

    // A browser cookie is a preference, never authorization. If it is stale or
    // belongs to another account, resolve only among this user's relationships.
    const tenant = await findAccessibleTenant(
      userId,
      req.cookies.get("tenant-user-id")?.value === userId
        ? req.cookies.get("tenant-id")?.value
        : undefined,
    );

    /* ---------------------------------------------------------
       STILL NONE → return empty (but valid response)
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
      }, { headers: PRIVATE_HEADERS });
    }

    console.log("✅ [tenant/me] Tenant found:", tenant.id);

    const r2Base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
    if (user.googleId && user.avatarUrl && r2Base && user.avatarUrl.startsWith(`${r2Base}/tenants/pending/`)) {
      try {
        user.avatarUrl = await persistGoogleAvatarForTenant({
          userId,
          tenantId: tenant.id,
          sourceUrl: user.avatarUrl,
        });
      } catch (avatarError) {
        console.error("[tenant/me] Could not move Google avatar into tenant storage", avatarError);
      }
    }

    /* ---------------------------------------------------------
       LOAD RELATED DATA
    --------------------------------------------------------- */
    const sites = await prisma.site.findMany({
      where: { tenantId: tenant.id, deletedAt: null },
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

    // PlanUsage only ever tracks metered AI credits — published pages have
    // no corresponding row there. Count them directly across every site
    // owned by this tenant so the "pages" usage key that the billing page
    // and header dropdown both already read is actually populated.
    const publishedPageCount = await prisma.page.count({
      where: {
        site: { tenantId: tenant.id, deletedAt: null },
        status: "PUBLISHED",
        deletedAt: null,
      },
    });
    const usageWithPages = [
      ...usage,
      { id: "pages", tenantId: tenant.id, key: "pages", used: publishedPageCount, billingCycle: null, periodStart: new Date(), periodEnd: null, updatedAt: new Date(), createdAt: new Date() },
    ];

    return NextResponse.json({
      data: {
        tenant,
        sites,
        teams,
        plan: subscription,
        usage: usageWithPages,
        user,
      },
    }, { headers: PRIVATE_HEADERS });

  } catch (err: any) {
    console.error("🔥 [tenant/me] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", detail: err.message },
      { status: 500, headers: PRIVATE_HEADERS }
    );
  }
}
