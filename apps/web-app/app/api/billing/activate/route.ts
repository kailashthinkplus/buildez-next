// /app/api/billing/activate/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [activate] START");

  try {
    const user = await getCurrentUser(req);
    console.log("👤 [activate] User:", user?.id);

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 [activate] Body:", body);

    const { planCode, billingCycle, paymentId, orderId, amount } = body;

    if (!planCode || !billingCycle) {
      return NextResponse.json(
        { ok: false, error: "Missing planCode or billingCycle" },
        { status: 400 }
      );
    }

    // 🔍 Prevent Duplicate Entries
    const existing = await prisma.subscription.findFirst({
      where: { razorpayPaymentId: paymentId },
    });

    if (existing) {
      console.log("ℹ️ Existing subscription found, skipping creation.");
      return NextResponse.json({
        ok: true,
        existing: true,
        subscriptionId: existing.id,
      });
    }

    // 🔥 CREATE NEW PRE-TENANT SUBSCRIPTION
    console.log("🧾 Creating PRE-TENANT subscription");

    const subscription = await prisma.subscription.create({
      data: {
        user: { connect: { id: user.id } },            // FIXED

        planCode,
        billingCycle,

        status: "AWAITING_ACTIVATION",
        paymentStatus: "PAID",

        amountPaid: amount,
        currency: "INR",

        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,

        paidAt: new Date(),
        startedAt: new Date(),
      },
    });

    console.log("💳 Subscription Created:", subscription.id);

    return NextResponse.json({
      ok: true,
      subscriptionId: subscription.id,
    });

  } catch (err: any) {
    console.error("🔥 [activate] ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}
