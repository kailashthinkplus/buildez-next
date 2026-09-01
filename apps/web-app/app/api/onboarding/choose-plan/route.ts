// /app/api/onboarding/choose-plan/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [choose-plan] START");

  try {
    const user = await getCurrentUser(req);
    console.log("👤 [choose-plan] User:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 [choose-plan] Body:", body);

    const planCode = typeof body.planId === "string" ? body.planId.trim().toUpperCase() : "";
    const billingCycle = body.billing === "yearly" ? "yearly" : body.billing === "monthly" ? "monthly" : "";

    if (!planCode || !billingCycle) {
      return NextResponse.json(
        { error: "Missing required fields: planId, billing" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findFirst({
      where: { code: planCode, isPublic: true },
      include: {
        pricing: { where: { billingCycle, isActive: true }, take: 1 },
      },
    });

    if (!plan || !plan.pricing[0]) {
      return NextResponse.json(
        { error: "That plan or billing cycle is no longer available." },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 1️⃣ Load or create onboarding row
    // ---------------------------------------------------------
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      console.log("📦 Creating onboarding row");
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: user.id,
          completed: false,
        },
      });
    }

    console.log("📝 Updating onboarding plan fields");

    // ---------------------------------------------------------
    // 2️⃣ Update plan selection
    // ---------------------------------------------------------
    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: {
        planCode,
        billingCycle,

        // DO NOT mark completed (only finish step does this)
      },
    });

    console.log("🏁 [choose-plan] SUCCESS");

    return NextResponse.json({ ok: true });

  } catch (err: unknown) {
    console.error("🔥 [choose-plan] ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
