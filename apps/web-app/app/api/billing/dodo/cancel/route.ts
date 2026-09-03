import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";
import { dodoClient } from "@/lib/billing/dodo";

export const runtime = "nodejs";

export async function POST() {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant || !auth.permissions.manageBilling) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscription = await prisma.subscription.findFirst({
    where: { tenantActiveId: auth.tenant.id, status: "ACTIVE" },
    select: { id: true, dodoSubscriptionId: true, cancelAtPeriodEnd: true, currentPeriodEnd: true },
  });
  if (!subscription?.dodoSubscriptionId) {
    return Response.json({ error: "No active subscription to cancel." }, { status: 404 });
  }
  if (subscription.cancelAtPeriodEnd) {
    return Response.json({ cancelAtPeriodEnd: true, currentPeriodEnd: subscription.currentPeriodEnd });
  }
  try {
    await dodoClient().subscriptions.update(subscription.dodoSubscriptionId, {
      status: "cancelled",
      cancel_at_next_billing_date: true,
      cancel_reason: "cancelled_by_customer",
    });
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
      select: { currentPeriodEnd: true },
    });
    return Response.json({ cancelAtPeriodEnd: true, currentPeriodEnd: updated.currentPeriodEnd });
  } catch (error) {
    console.error("Subscription cancellation failed:", error);
    return Response.json({ error: "Your plan could not be cancelled. Please try again." }, { status: 502 });
  }
}
