import { prisma } from "@buildez/db";
import { sendMail } from "@/lib/email/sendMail";
import { subscriptionExpiryEmailContent } from "@/lib/email/subscriptionExpiryTemplate";

const ALERT_WINDOW_DAYS = 3;

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.PLATFORM_DOMAIN || "getbuildezy.com"}`).replace(/\/$/, "");
}

/*
 * Called only from the external-cron route (app/api/cron/check-subscription-expiry),
 * never from instrumentation.ts's in-process interval — a multi-day alert window
 * has no need for sub-minute freshness, so there's no reason to risk pulling
 * nodemailer into that route's edge-compiled bundle graph (see the comment on
 * publishPageNow in lib/publishing/publishPage.ts for why that matters here).
 *
 * Deduplicated via Subscription.expiryAlertSentAt: once a subscription has been
 * notified for its current billing period, it's skipped until currentPeriodEnd
 * (and therefore the alert window) moves forward again.
 */
export async function runExpiryAlertScan() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + ALERT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const due = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { gte: now, lte: windowEnd },
      expiryAlertSentAt: null,
      userId: { not: null },
    },
    include: {
      Plan: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const subscription of due) {
    try {
      const email = subscription.user?.email;
      if (!email || !subscription.currentPeriodEnd) {
        await prisma.subscription.update({ where: { id: subscription.id }, data: { expiryAlertSentAt: now } });
        continue;
      }

      const { subject, text, html } = subscriptionExpiryEmailContent({
        planName: subscription.Plan?.name || subscription.planCode || "your plan",
        periodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        manageUrl: `${appUrl()}/app/workspace/billing`,
      });
      await sendMail({ to: email, subject, text, html });

      await prisma.subscription.update({ where: { id: subscription.id }, data: { expiryAlertSentAt: now } });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`[expiry alert] failed for subscription ${subscription.id}:`, error);
    }
  }

  return { scanned: due.length, sent, failed };
}
