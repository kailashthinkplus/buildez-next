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

    const { planId, billing: billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: "Missing required fields: planId, billing" },
        { status: 400 }
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
        planCode: planId,
        billingCycle,

        // DO NOT mark completed (only finish step does this)
      },
    });

    console.log("🏁 [choose-plan] SUCCESS");

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("🔥 [choose-plan] ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
