import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { syncLatestDodoSubscriptionPayment } from "@/lib/billing/dodo";

export async function GET() {
  try {
    const auth = await getUser();

    if (!auth?.user || !auth.tenant) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantActiveId: auth.tenant.id,
        status: "ACTIVE",
      },
      orderBy: {
        paidAt: "desc",
      },
      select: {
        planCode: true,
        billingCycle: true,
        amountPaid: true,
        dodoCustomerId: true,
        dodoSubscriptionId: true,
        dodoCheckoutSessionId: true,
        currentPeriodEnd: true,
        paymentStatus: true,
        status: true,
        paidAt: true,
      },
    });

    let latestPayment = await prisma.billingTransaction.findFirst({
      where: { tenantId: auth.tenant.id, status: "SUCCEEDED", type: "SUBSCRIPTION" },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      select: {
        amountMinor: true,
        currency: true,
        paidAt: true,
        providerPaymentId: true,
      },
    });

    if (subscription?.dodoSubscriptionId) {
      try {
        await syncLatestDodoSubscriptionPayment(
          subscription.dodoSubscriptionId,
        );
        latestPayment = await prisma.billingTransaction.findFirst({
          where: {
            tenantId: auth.tenant.id,
            status: "SUCCEEDED",
            type: "SUBSCRIPTION",
          },
          orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
          select: {
            amountMinor: true,
            currency: true,
            paidAt: true,
            providerPaymentId: true,
          },
        });
      } catch (error) {
        console.error("Latest Dodo payment could not be synchronized:", error);
      }
    }

    return NextResponse.json({
      ok: true,
      subscription: subscription ? {
        planCode: subscription.planCode,
        billingCycle: subscription.billingCycle,
        amountPaid: subscription.amountPaid,
        billingAccountId: subscription.dodoCustomerId,
        subscriptionReference: subscription.dodoSubscriptionId,
        checkoutReference: subscription.dodoCheckoutSessionId,
        currentPeriodEnd: subscription.currentPeriodEnd,
        paymentStatus: subscription.paymentStatus,
        status: subscription.status,
        paidAt: subscription.paidAt,
      } : null,
      latestPayment: latestPayment ? {
        amountMinor: latestPayment.amountMinor,
        currency: latestPayment.currency,
        paidAt: latestPayment.paidAt,
        reference: latestPayment.providerPaymentId,
      } : null,
    });
  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Billing could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
