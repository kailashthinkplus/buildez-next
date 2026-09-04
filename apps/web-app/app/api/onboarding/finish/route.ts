// /app/api/onboarding/finish/route.ts

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { nextAvailablePublicSiteSlug } from "@/lib/sites/public-slug";
import { DOMAIN_SERVER_IP, validDomain } from "@/lib/domain-provisioning";

async function ensurePendingCustomDomain(siteId: string, tenantId: string, requestedDomain: string | null) {
  const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
  const domain = (requestedDomain || "").toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0].replace(/\.$/, "");
  if (!validDomain(domain) || domain === platformDomain || domain.endsWith(`.${platformDomain}`)) return false;
  const existing = await prisma.siteDomain.findUnique({ where: { domain } });
  if (existing) {
    if (existing.siteId !== siteId || existing.tenantId !== tenantId) throw new Error("DOMAIN_ALREADY_CONNECTED");
    return true;
  }
  await prisma.siteDomain.create({
    data: {
      siteId,
      tenantId,
      domain,
      cnameTarget: DOMAIN_SERVER_IP,
      verificationToken: `buildez-verification=${crypto.randomBytes(24).toString("base64url")}`,
    },
  });
  return true;
}

function onboardingBrand(onboarding: {
  businessName: string | null; profession: string | null; primaryUseCase: string | null;
  website: string | null; city: string | null; country: string | null;
}) {
  return {
    brandIntelligence: {
      companyName: onboarding.businessName || "My First Site",
      industry: onboarding.profession || "",
      audience: "",
      offer: onboarding.primaryUseCase?.replaceAll("_", " ") || "",
      tone: "",
      websiteUrl: onboarding.website || "",
      location: [onboarding.city, onboarding.country].filter(Boolean).join(", "),
      source: "onboarding",
    },
  };
}

async function syncOnboardingBrand(siteId: string | undefined, onboarding: Parameters<typeof onboardingBrand>[0]) {
  if (!siteId) return;
  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designTokens: true } });
  const current = site?.designTokens && typeof site.designTokens === "object" ? site.designTokens as Record<string, unknown> : {};
  await prisma.site.update({ where: { id: siteId }, data: {
    name: onboarding.businessName || "My First Site",
    designTokens: { ...current, ...onboardingBrand(onboarding) },
  }});
}

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

    if (!onboarding.planCode) {
      return NextResponse.json({ error: "PLAN_NOT_SELECTED" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
  where: {
    code: onboarding.planCode,
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
    const publicSiteSlug = await nextAvailablePublicSiteSlug(
      onboarding.domain?.split(".")[0] || onboarding.businessName || "website",
    );

    // ===============================================================
    // 🅰️ PAID PLAN — Create Tenant + Activate Subscription
    // ===============================================================
    if (requiresPayment) {
      console.log("💳 FINISH: Paid flow");

      // Load PRE-TENANT subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          planCode: onboarding.planCode,
          status: { in: ["ACTIVE", "AWAITING_ACTIVATION"] },
          paymentStatus: "PAID",
        },
        orderBy: { createdAt: "desc" },
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

        const existingSite = existingTenant.sites[0] || await prisma.site.create({
          data: { name: onboarding.businessName || "My First Site", slug: publicSiteSlug, tenantId: existingTenant.id, designTokens: onboardingBrand(onboarding) },
        });
        await syncOnboardingBrand(existingSite.id, onboarding);
        const customDomainPending = await ensurePendingCustomDomain(existingSite.id, existingTenant.id, onboarding.domain);
        await prisma.userOnboarding.update({
          where: { userId: user.id },
          data: { completed: true, planCode: subscription.planCode, billingCycle: subscription.billingCycle },
        });
        return NextResponse.json({
          ok: true,
          tenantId: existingTenant.id,
          siteId: existingSite.id,
          siteSlug: existingSite.slug,
          customDomainPending,
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
              name: onboarding.businessName || "My First Site",
              slug: publicSiteSlug,
              designTokens: onboardingBrand(onboarding),
            }],
          },
        },
        include: {
          sites: true,
        },
      });

      const siteId = tenant.sites[0].id;
      const customDomainPending = await ensurePendingCustomDomain(siteId, tenant.id, onboarding.domain);

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
        siteSlug: tenant.sites[0].slug,
        customDomainPending,
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

      // Ensure it's active, and backfill planId for rows created before
      // this field was set here (see the create branch below).
      if (existingSubscription.status !== "ACTIVE" || !existingSubscription.planId) {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "ACTIVE",
            paymentStatus: "FREE",
            startedAt: existingSubscription.startedAt || new Date(),
            planId: existingSubscription.planId || plan.id,
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
          planId: plan.id,
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
          slug: publicSiteSlug,
          tenantId: tenant.id,
        },
      });

      finalSiteId = newSite.id;
      console.log("✅ Default site created:", finalSiteId);
    }

    await syncOnboardingBrand(finalSiteId, onboarding);

    console.log("✅ Trial onboarding completed");

    return NextResponse.json({
      ok: true,
      tenantId: tenant.id,
      siteId: finalSiteId,
      siteSlug: tenant.sites.find((site) => site.id === finalSiteId)?.slug || publicSiteSlug,
    });

  } catch (err: any) {
    console.error("🔥 [finish] ERROR:", err);
    return NextResponse.json(
      { error: "FINISH_FAILED", detail: err.message },
      { status: 500 }
    );
  }
}
