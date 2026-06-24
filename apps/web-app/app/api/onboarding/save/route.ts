// /app/api/onboarding/save/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [onboarding/save] START");

  try {
    const user = await getSessionUser();
    if (!user) {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 [onboarding/save] Body:", body);

    const {
      accountType,
      businessName,
      industry,
      role,
      city,
      country,
      website,
      companySize,
      primaryUseCase,
      planCode,
      billingCycle,
      domain,
    } = body;

    // ---------------------------------------------------------
    // LOAD OR CREATE ONBOARDING
    // ---------------------------------------------------------
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      console.log("📦 Creating new onboarding row");
      onboarding = await prisma.userOnboarding.create({
        data: { userId: user.id, completed: false },
      });
    }

    // ---------------------------------------------------------
    // SAFELY BUILD UPDATE OBJECT
    // ---------------------------------------------------------
    const updateData: Record<string, any> = {};

    if (accountType !== undefined) updateData.accountType = accountType;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (industry !== undefined) updateData.industry = industry;
    if (role !== undefined) updateData.role = role;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (website !== undefined) updateData.website = website;

    if (companySize !== undefined) updateData.companySize = companySize;
    if (primaryUseCase !== undefined) updateData.primaryUseCase = primaryUseCase;

    // ---------------------------------------------------------
    // PLAN INFO
    // ---------------------------------------------------------
    if (planCode !== undefined) {
      updateData.planCode = planCode;

      // Auto-correct: trial plans ALWAYS monthly billing
      if (planCode === "trial") {
        updateData.billingCycle = "monthly";
      }
    }

    if (billingCycle !== undefined) {
      if (onboarding.planCode === "trial") {
        updateData.billingCycle = "monthly"; // force trial billing
      } else {
        updateData.billingCycle = billingCycle;
      }
    }

    // ---------------------------------------------------------
    // DOMAIN — only save if planCode exists
    // Prevents user from setting domain before choosing paid plan
    // ---------------------------------------------------------
    if (domain !== undefined) {
      updateData.domain = domain ?? null;
    }

    // ---------------------------------------------------------
    // NEVER set completed here
    // completed is ONLY set via /api/onboarding/finish
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // APPLY UPDATE
    // ---------------------------------------------------------
    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: updateData,
    });

    console.log("✅ [onboarding/save] Updated:", updateData);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ [onboarding/save] ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
