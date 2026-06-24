import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        paymentStatus: "PAID",
      },
      orderBy: {
        paidAt: "desc",
      },
      select: {
        planCode: true,
        billingCycle: true,
        amountPaid: true,
        razorpayPaymentId: true,
        razorpayOrderId: true,
        paymentStatus: true,
        status: true,
        paidAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      subscription,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}