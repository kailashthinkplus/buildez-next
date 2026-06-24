import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  console.log("🚀 [trial/verify] START");

  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { customerId, tokenId } = body;

    console.log("📥 Body:", body);

    // Load onboarding
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Onboarding missing" }, { status: 404 });
    }

    // Create subscription: starter trial
    await prisma.subscription.create({
      data: {
        tenantId: onboarding.tenantId!,
        planCode: "starter",
        billingCycle: "monthly",
        status: "trial_active",
        razorpayCustomerId: customerId,
        razorpayTokenId: tokenId,
        mandateStatus: "authenticated",
        trialEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: { completed: true },
    });

    console.log("✅ Starter Trial Activated");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 [trial/verify] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
