// /app/api/onboarding/finish/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [finish] START");

  try {
    const user = await getCurrentUser(req);
    console.log("👤 User:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---------------------------------------------------------
    // LOAD ONBOARDING
    // ---------------------------------------------------------
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "ONBOARDING_NOT_FOUND" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
  where: {
    code: onboarding.planCode!,
  },
  include: {
    pricing: {
      where: {
        isActive: true,
      },
    },
  },
});

if (!plan) {
  return NextResponse.json(
    { error: "PLAN_NOT_FOUND" },
    { status: 400 }
  );
}

const requiresPayment = plan.pricing.some((p) => p.amount > 0);

    // ===============================================================
    // 🅰️ PAID PLAN — Create Tenant + Activate Subscription
    // ===============================================================
    if (requiresPayment) {
      console.log("💳 FINISH: Paid flow");

      // Load PRE-TENANT subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: "AWAITING_ACTIVATION",
          paymentStatus: "PAID",
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { error: "NO_PENDING_SUBSCRIPTION" },
          { status: 400 }
        );
      }

      console.log("📦 Loaded pending subscription:", subscription.id);

      // Check if tenant already exists (idempotency)
      const existingTenant = await prisma.tenant.findFirst({
        where: { ownerId: user.id },
        include: { sites: true },
      });

      if (existingTenant) {
        console.log("🔄 Tenant already exists, returning existing");
        
        // Make sure subscription is activated
        if (subscription.status !== "ACTIVE") {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              tenantActiveId: existingTenant.id,
              tenantHistoryId: existingTenant.id,
              status: "ACTIVE",
            },
          });
        }

        // Mark onboarding complete
        await prisma.userOnboarding.update({
          where: { userId: user.id },
          data: {
            completed: true,
            planCode: subscription.planCode,
            billingCycle: subscription.billingCycle,
          },
        });

        return NextResponse.json({
          ok: true,
          tenantId: existingTenant.id,
          siteId: existingTenant.sites[0]?.id,
          existed: true,
        });
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: onboarding.businessName || "My Workspace",
          domain: onboarding.domain || null,
          ownerId: user.id,

          subscriptionId: subscription.id,

          teams: {
            create: [{
              name: "Default Team",
              slug: `team_${Date.now()}`,
              members: {
                create: {
                  userId: user.id,
                  role: "OWNER",
                },
              },
            }],
          },

          sites: {
            create: [{
              name: "My First Site",
              slug: "home",
            }],
          },
        },
        include: {
          sites: true,
        },
      });

      const siteId = tenant.sites[0].id;

      console.log("🏁 Tenant created:", tenant.id);

      // Activate subscription fully
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tenantActiveId: tenant.id,
          tenantHistoryId: tenant.id,
          status: "ACTIVE",
        },
      });

      console.log("🔧 Subscription activated:", subscription.id);

      // ---------------------------------------------------------
      // ⭐ CRITICAL FIX — SYNC PLAN + BILLING INTO ONBOARDING
      // ---------------------------------------------------------
      await prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          completed: true,
          planCode: subscription.planCode,
          billingCycle: subscription.billingCycle,
        },
      });

      console.log("✅ Onboarding updated with plan + billing");

      return NextResponse.json({
        ok: true,
        tenantId: tenant.id,
        siteId,
      });
    }

    // ===============================================================
    // 🅱️ TRIAL PLAN — Tenant already created earlier
    // ===============================================================
    console.log("🎁 FINISH: Trial flow");

    const tenant = await prisma.tenant.findFirst({
      where: { ownerId: user.id },
      include: { sites: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "TENANT_NOT_CREATED_FOR_TRIAL" },
        { status: 400 }
      );
    }

    const siteId = tenant.sites[0]?.id;

    // ✅ FIX: Check if subscription already exists for this tenant
    const existingSubscription = await prisma.subscription.findFirst({
      where: { tenantActiveId: tenant.id },
    });

    let subscription;

    if (existingSubscription) {
      // Subscription already exists - just update it if needed
      console.log("🔄 Subscription already exists:", existingSubscription.id);
      subscription = existingSubscription;

      // Ensure it's active
      if (existingSubscription.status !== "ACTIVE") {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "ACTIVE",
            paymentStatus: "FREE",
            startedAt: existingSubscription.startedAt || new Date(),
          },
        });
      }
    } else {
      // Create new trial subscription
      subscription = await prisma.subscription.create({
        data: {
          tenantActiveId: tenant.id,
          tenantHistoryId: tenant.id,
          planCode: onboarding.planCode || "trial",
          billingCycle: onboarding.billingCycle || "monthly",
          status: "ACTIVE",
          paymentStatus: "FREE",
          startedAt: new Date(),
        },
      });

      console.log("🎁 Trial subscription created:", subscription.id);
    }

    // Update tenant with subscription ID if not already set
    if (!tenant.subscriptionId || tenant.subscriptionId !== subscription.id) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { subscriptionId: subscription.id },
      });
    }

    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: {
        completed: true,
        planCode: onboarding.planCode || "trial",
        billingCycle: onboarding.billingCycle || "monthly",
      },
    });

    // ✅ ENSURE SITE EXISTS (safety check)
    let finalSiteId = siteId;
    if (!finalSiteId) {
      console.log("⚠️ No site found - creating default site");
      
      const newSite = await prisma.site.create({
        data: {
          name: "My First Site",
          slug: "home",
          tenantId: tenant.id,
        },
      });

      finalSiteId = newSite.id;
      console.log("✅ Default site created:", finalSiteId);
    }

    console.log("✅ Trial onboarding completed");

    return NextResponse.json({
      ok: true,
      tenantId: tenant.id,
      siteId: finalSiteId,
    });

  } catch (err: any) {
    console.error("🔥 [finish] ERROR:", err);
    return NextResponse.json(
      { error: "FINISH_FAILED", detail: err.message },
      { status: 500 }
    );
  }
}
