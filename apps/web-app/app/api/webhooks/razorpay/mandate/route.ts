import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  console.log("⚡ Webhook Received:", body);

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    console.log("❌ Invalid Razorpay signature");
    return NextResponse.json({ status: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.authorized") {
    const tokenId = event.payload.payment.entity.token_id;
    const customerId = event.payload.customer?.entity?.id;

    console.log("🔄 Updating subscription based on webhook");

    await prisma.subscription.updateMany({
      where: { razorpayTokenId: tokenId, razorpayCustomerId: customerId },
      data: { mandateStatus: "authenticated" },
    });
  }

  return NextResponse.json({ status: "ok" });
}
