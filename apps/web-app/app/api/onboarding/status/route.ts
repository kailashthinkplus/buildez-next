// /app/api/onboarding/status/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";
import { firebasePhoneVerificationConfigured } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  console.log("🚀 [onboarding-status] START");

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 [onboarding-status] User:", user.id);

    /* ---------------------------------------------------------
       LOAD OR CREATE ONBOARDING ROW
    --------------------------------------------------------- */
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      console.log("📦 No onboarding row → creating empty onboarding entry");
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: user.id,
          completed: false,
        },
      });
    }

    /* ---------------------------------------------------------
       CLEAN VALUES FOR CLIENT
    --------------------------------------------------------- */
    const accountType = onboarding.accountType ?? null;
    const businessName = onboarding.businessName ?? null;
    const planCode = onboarding.planCode ?? null;

    const billingCycle = ["monthly", "yearly", "forever"].includes(
      onboarding.billingCycle ?? ""
    )
      ? onboarding.billingCycle
      : null;

    const domain = onboarding.domain ?? null;

    /* ---------------------------------------------------------
       PROFILE COMPLETENESS
       Mirrors StepBusinessDetails' own validation. A business
       account already has `businessName` set at signup, so
       gating step 1 on businessName alone let business accounts
       skip StepBusinessDetails entirely and left city/country/
       profession/companySize/primaryUseCase permanently null.
    --------------------------------------------------------- */
    const hasPersonalFields = Boolean(
      onboarding.firstName &&
      onboarding.lastName &&
      onboarding.city &&
      onboarding.country &&
      onboarding.profession
    );
    const profileComplete =
      accountType === "business"
        ? hasPersonalFields &&
          Boolean(businessName) &&
          Boolean(onboarding.companySize) &&
          Boolean(onboarding.primaryUseCase)
        : hasPersonalFields;

    /* ---------------------------------------------------------
       PHONE VERIFICATION (Firebase)
       Only enforced once Firebase is actually configured server-side
       — otherwise this step is treated as satisfied so onboarding
       isn't blocked before the project/service account exist.
    --------------------------------------------------------- */
    const phoneVerificationConfigured = firebasePhoneVerificationConfigured();
    const phoneVerificationRequired = phoneVerificationConfigured;
    const phoneVerified = !phoneVerificationRequired || Boolean(user.isPhoneVerified);

    /* ---------------------------------------------------------
       PAID PLAN COMPLETENESS
       A saved plan is not enough for paid onboarding: users must
       remain on the plan step until Dodo confirms the subscription.
    --------------------------------------------------------- */
    let paymentComplete = true;
    let planRequiresPayment = false;

    if (planCode && billingCycle) {
      const selectedPlan = await prisma.plan.findUnique({
        where: { code: planCode },
        include: {
          pricing: {
            where: { billingCycle, isActive: true },
            take: 1,
          },
        },
      });
      planRequiresPayment = Number(selectedPlan?.pricing[0]?.amount ?? 0) > 0;

      if (planRequiresPayment) {
        const paidSubscription = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            planCode,
            paymentStatus: "PAID",
            status: { in: ["ACTIVE", "AWAITING_ACTIVATION"] },
          },
          select: { id: true },
        });
        paymentComplete = Boolean(paidSubscription);
      }
    }

    /* ---------------------------------------------------------
       STEP CALCULATION (SERVER IS SOURCE OF TRUTH)
       0 Account type
       1 Phone verification
       2 Business/profile details
       3 Choose plan
       4 Domain & launch
       5 Finish
    --------------------------------------------------------- */

    // DEFAULT step = 0
    let step = 0;

    if (!accountType) step = 0;
    else if (!phoneVerified) step = 1;
    else if (!profileComplete) step = 2;
    else if (!planCode || !paymentComplete) step = 3;
    else if (!domain && !onboarding.domainSkipped) step = 4;
    else step = 5;

    console.log("➡️ [onboarding-status] Computed step:", step);

    /* ---------------------------------------------------------
       RETURN CONSISTENT OBJECT
    --------------------------------------------------------- */
    return NextResponse.json({
      exists: true,
      completed: Boolean(onboarding.completed),
      step,

      // PERSONAL INFO
      firstName: onboarding.firstName ?? null,
      lastName: onboarding.lastName ?? null,
      city: onboarding.city ?? null,
      country: onboarding.country ?? null,
      profession: onboarding.profession ?? null,
      website: onboarding.website ?? null,

      // PHONE
      phone: user.phone ?? null,
      phoneVerified,
      phoneVerificationRequired,
      phoneVerificationConfigured,

      // BUSINESS INFO
      accountType,
      businessName,
      companySize: onboarding.companySize ?? null,
      primaryUseCase: onboarding.primaryUseCase ?? null,

      // PLAN + BILLING
      planCode,
      billingCycle,
      domain,
      domainSkipped: onboarding.domainSkipped,
      planRequiresPayment,
      paymentComplete,
    });
  } catch (err: any) {
    console.error("❌ [onboarding-status] ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
