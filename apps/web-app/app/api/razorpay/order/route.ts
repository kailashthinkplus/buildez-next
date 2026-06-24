console.log("🚀 ORDER ROUTE FIRED");

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🚀 [ORDER] API HIT");
  console.log("🚨 RZP KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("🚨 RZP KEY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "loaded" : "missing");


  try {
    const raw = await req.text();
    console.log("📥 [ORDER] Raw Body:", raw);

    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      console.error("❌ [ORDER] JSON Parse Error:", e);
      return NextResponse.json(
        { error: "Invalid JSON body", raw },
        { status: 400 }
      );
    }

    const { amount, currency = "INR", receipt } = body;

    console.log("📦 [ORDER] Parsed Body:", body);

    if (!amount) {
      console.error("❌ [ORDER] Missing amount");
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // ENV LOGS (masked for safety)
    console.log("🔐 [ORDER] ENV Keys:", {
      key_id: process.env.RAZORPAY_KEY_ID
        ? process.env.RAZORPAY_KEY_ID.slice(0, 6) + "****"
        : "MISSING",
      key_secret: process.env.RAZORPAY_KEY_SECRET
        ? process.env.RAZORPAY_KEY_SECRET.slice(0, 4) + "****"
        : "MISSING",
    });

    const key_id = process.env.RAZORPAY_KEY_ID!;
    const key_secret = process.env.RAZORPAY_KEY_SECRET!;

    const orderPayload = {
      amount: amount * 100,
      currency,
      receipt: receipt || "rcpt_" + Date.now(),
    };

    console.log("📤 [ORDER] Payload to Razorpay:", orderPayload);

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

    const response = await fetch(`https://api.razorpay.com/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    console.log("🔎 [ORDER] Razorpay Response Status:", response.status);

    let order;
    const text = await response.text();

    try {
      order = JSON.parse(text);
    } catch (e) {
      console.error("❌ [ORDER] Razorpay JSON Parse Error:", e);
      console.error("⬇️ [ORDER] Raw Razorpay Response:", text);

      return NextResponse.json(
        {
          error: "Razorpay returned non-JSON response",
          raw: text,
        },
        { status: 500 }
      );
    }

    console.log("📦 [ORDER] Razorpay JSON Response:", order);

    if (order.error) {
      console.error("❌ [ORDER] Razorpay Order Error:", order.error);
      return NextResponse.json({ error: order.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
    });
  } catch (err) {
    console.error("🔥 [ORDER] SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", detail: String(err) },
      { status: 500 }
    );
  }
}
