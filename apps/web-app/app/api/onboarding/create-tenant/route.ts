// /app/api/onboarding/create-tenant/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [create-tenant] START");

  try {
    const user = await getCurrentUser(req);
    console.log("👤 User:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load onboarding
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      console.log("❌ No onboarding row");
      return NextResponse.json({ error: "ONBOARDING_NOT_FOUND" }, { status: 400 });
    }

    console.log("📦 Onboarding:", {
      planCode: onboarding.planCode,
      businessName: onboarding.businessName,
    });

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

    // ---------------------------------------------------------
    // 1️⃣ PAID PLAN CASE — DO NOT CREATE tenant here
    // ---------------------------------------------------------
    if (requiresPayment) {
      console.log("💳 Paid plan — tenant is created in FINISH step");
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "PAID_PLAN_TENANT_CREATED_IN_FINISH",
      });
    }

    // ---------------------------------------------------------
    // 2️⃣ TRIAL PLAN → Check if tenant already exists
    // ---------------------------------------------------------
    const existingTenant = await prisma.tenant.findFirst({
      where: { ownerId: user.id },
      include: { sites: true },
    });

    if (existingTenant) {
      console.log("🔄 Tenant already exists:", existingTenant.id);

      // ✅ ENSURE SITE EXISTS (fix for missing sites)
      if (existingTenant.sites.length === 0) {
        console.log("⚠️ Tenant has no sites - creating default site");
        
        await prisma.site.create({
          data: {
            name: "My First Site",
            slug: "home",
            tenantId: existingTenant.id,
          },
        });

        console.log("✅ Default site created for existing tenant");
      }

      return NextResponse.json({
        ok: true,
        tenantId: existingTenant.id,
        existed: true,
      });
    }

    // ---------------------------------------------------------
    // 3️⃣ CREATE NEW TENANT WITH SITE
    // ---------------------------------------------------------
    console.log("🆕 Creating tenant for TRIAL plan");

    const tenant = await prisma.tenant.create({
      data: {
        name: onboarding.businessName || "My Workspace",
        domain: onboarding.domain || null,
        ownerId: user.id,
        subscriptionId: null,

        // Create default team
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

        // Create default site
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

    console.log("🏁 TRIAL tenant created:", tenant.id);
    console.log("📄 Sites created:", tenant.sites.length);

    // ✅ DOUBLE-CHECK: If sites weren't created in nested write, create separately
    if (tenant.sites.length === 0) {
      console.log("⚠️ Nested site creation failed - creating separately");
      
      await prisma.site.create({
        data: {
          name: "My First Site",
          slug: "home",
          tenantId: tenant.id,
        },
      });

      console.log("✅ Site created separately");
    }

    return NextResponse.json({
      ok: true,
      tenantId: tenant.id,
      created: true,
    });

  } catch (err: any) {
    console.error("🔥 [create-tenant] ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
