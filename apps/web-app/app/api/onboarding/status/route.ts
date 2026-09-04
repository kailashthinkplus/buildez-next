// /app/api/onboarding/status/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

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

    console.log("📦 [onboarding-status] Onboarding Loaded:", onboarding);

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
    const phoneVerificationRequired = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const phoneVerified = !phoneVerificationRequired || Boolean(user.isPhoneVerified);

    /* ---------------------------------------------------------
       STEP CALCULATION (SERVER IS SOURCE OF TRUTH)
       0 Account type
       1 Phone verification
       2 Business/profile details
       3 Choose plan
       4 Domain & launch (trial only)
       5 Finish
    --------------------------------------------------------- */

    // DEFAULT step = 0
    let step = 0;

    if (!accountType) step = 0;
    else if (!phoneVerified) step = 1;
    else if (!profileComplete) step = 2;
    else if (!planCode) step = 3;

    // ⭐ Paid plan → SKIP domain step
    else if (planCode !== "trial") step = 5;

    // ⭐ Trial plan → requires domain before finish
    else if (!domain) step = 4;

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

      // BUSINESS INFO
      accountType,
      businessName,
      companySize: onboarding.companySize ?? null,
      primaryUseCase: onboarding.primaryUseCase ?? null,

      // PLAN + BILLING
      planCode,
      billingCycle,
      domain,
    });
  } catch (err: any) {
    console.error("❌ [onboarding-status] ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
