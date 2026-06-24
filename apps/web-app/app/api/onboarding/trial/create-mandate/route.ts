import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [trial/create-mandate] START");

  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { customerId, method } = body;

    console.log("📥 Body:", body);

    const res = await fetch(`${process.env.RAZORPAY_BASE_URL}/payment_methods`, {
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
        customer_id: customerId,
        type: "card",
        method,
      }),
    });

    const mandate = await res.json();
    console.log("📦 Mandate:", mandate);

    if (!mandate.id) {
      return NextResponse.json({ error: "Failed to create mandate" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mandateId: mandate.id,
    });
  } catch (err) {
    console.error("🔥 [trial/create-mandate] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
