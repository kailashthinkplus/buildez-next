import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  console.log("🚀 [pay/create-order] START");

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planCode, billingCycle } = body;

    console.log("📥 Body:", body);

    if (!planCode || !billingCycle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate plan pricing
    const pricing = await prisma.planPricing.findUnique({
      where: {
        planCode_billingCycle: {
          planCode,
          billingCycle,
        },
      },
    });

    if (!pricing) {
      return NextResponse.json({ error: "Invalid plan/billing" }, { status: 400 });
    }

    // Razorpay amount in paise
    const amountPaise = pricing.amount * 100;

    console.log("💰 Creating Razorpay order", {
      planCode,
      billingCycle,
      amountPaise,
    });

    // Create Order
    const orderRes = await fetch(`${process.env.RAZORPAY_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.RAZORPAY_KEY_ID + ":" + process.env.RAZORPAY_KEY_SECRET
          ).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: pricing.currency,
        notes: {
          userId: user.id,
          planCode,
          billingCycle,
        },
      }),
    });

    const order = await orderRes.json();
    console.log("📦 Razorpay Order Response:", order);

    if (!order.id) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      currency: pricing.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("🔥 [pay/create-order] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
