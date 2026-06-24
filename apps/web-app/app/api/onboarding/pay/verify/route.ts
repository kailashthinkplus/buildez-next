// /app/api/razorpay/verify/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [VERIFY] HIT");

  try {
    // ----------------------------------------------------
    // READ RAW BODY (required for Razorpay)
    // ----------------------------------------------------
    const raw = await req.text();
    console.log("📥 Raw Body:", raw);

    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      return NextResponse.json({ error: "Invalid JSON", raw }, { status: 400 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "Missing Razorpay fields" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { verified: false, error: "Missing Razorpay secret" },
        { status: 500 }
      );
    }

    // ----------------------------------------------------
    // SIGNATURE CHECK
    // ----------------------------------------------------
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return NextResponse.json(
        { verified: false, mismatch: true },
        { status: 400 }
      );
    }

    console.log("✅ Signature Verified");

    // ----------------------------------------------------
    // LOAD CURRENT USER
    // ----------------------------------------------------
    const user = await getCurrentUser(req);

    if (!user) {
      console.log("⚠️ No logged-in user — allowed for webhook style");
      return NextResponse.json({
        verified: true,
        warning: "NO_SESSION_USER",
      });
    }

    console.log("👤 User:", user.id);

    // ----------------------------------------------------
    // LOAD ONBOARDING
    // ----------------------------------------------------
    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!onboarding) {
      return NextResponse.json(
        { verified: true, error: "NO_ONBOARDING" },
        { status: 400 }
      );
    }

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

    // ----------------------------------------------------
    // IF TRIAL PLAN → NO SUBSCRIPTION NEEDED
    // ----------------------------------------------------
    if (!requiresPayment) {
      console.log("🎁 Trial plan: skipping subscription creation");
      return NextResponse.json({
        verified: true,
        trial: true,
      });
    }

    // ----------------------------------------------------
    // CREATE PRE-TENANT SUBSCRIPTION
    //
    // MUST MATCH FINAL MODEL:
    //
    // userId           = USER
    // tenantActiveId   = null
    // tenantHistoryId  = null
    // status           = AWAITING_ACTIVATION
    // paymentStatus    = PAID
    //
    // ----------------------------------------------------

    // Safety: check if subscription already exists for this payment
    const existing = await prisma.subscription.findFirst({
      where: {
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    if (existing) {
      console.log("ℹ️ Subscription already exists, returning");
      return NextResponse.json({
        verified: true,
        subscriptionId: existing.id,
        duplicate: true,
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        user: { connect: { id: user.id } }, // new relation requirement

        tenantActiveId: null,
        tenantHistoryId: null,

        planCode: onboarding.planCode,
        billingCycle: onboarding.billingCycle,

        status: "AWAITING_ACTIVATION",
        paymentStatus: "PAID",

        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,

        startedAt: new Date(),
        paidAt: new Date(),
      },
    });

    console.log("💳 PRE-TENANT subscription created:", subscription.id);

    // Ensure onboarding stays incomplete until finish
    await prisma.userOnboarding.update({
      where: { userId: user.id },
      data: { completed: false },
    });

    return NextResponse.json({
      verified: true,
      subscriptionId: subscription.id,
    });

  } catch (err: any) {
    console.error("🔥 VERIFY ERROR:", err);
    return NextResponse.json(
      { verified: false, error: "VERIFY_FAILED", detail: err.message },
      { status: 500 }
    );
  }
}
