import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [VERIFY] HIT");

  try {
    const raw = await req.text();
    console.log("📥 Raw Body:", raw);

    let body;
    try {
      body = JSON.parse(raw);
    } catch (err) {
      return NextResponse.json(
        { verified: false, error: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { verified: false, error: "NO_SECRET" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return NextResponse.json(
        { verified: false, mismatch: true },
        { status: 400 }
      );
    }

    console.log("✅ Signature verified");

    // DO NOT CREATE SUBSCRIPTION HERE
    // DO NOT TOUCH ONBOARDING HERE

    return NextResponse.json({
      verified: true,
    });
  } catch (err: any) {
    console.error("🔥 VERIFY ERROR:", err);
    return NextResponse.json(
      { verified: false, error: "SERVER_ERROR", detail: err.message },
      { status: 500 }
    );
  }
}
