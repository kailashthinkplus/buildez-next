import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  console.log("🚀 [trial/create-customer] START");

  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, phone } = body;

    console.log("📥 Body:", body);

    const res = await fetch(`${process.env.RAZORPAY_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.RAZORPAY_KEY_ID + ":" + process.env.RAZORPAY_KEY_SECRET
          ).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, contact: phone }),
    });

    const customer = await res.json();
    console.log("📦 Customer:", customer);

    if (!customer.id) {
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    });
  } catch (err) {
    console.error("🔥 [trial/create-customer] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
