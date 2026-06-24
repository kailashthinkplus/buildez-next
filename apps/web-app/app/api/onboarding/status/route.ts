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
       STEP CALCULATION (SERVER IS SOURCE OF TRUTH)
    --------------------------------------------------------- */

    // DEFAULT step = 0
    let step = 0;

    if (!accountType) step = 0;
    else if (!businessName) step = 1;
    else if (!planCode) step = 2;

    // ⭐ Paid plan → SKIP domain step
    else if (planCode !== "trial") step = 4;

    // ⭐ Trial plan → requires domain before finish
    else if (!domain) step = 3;

    else step = 4;

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
