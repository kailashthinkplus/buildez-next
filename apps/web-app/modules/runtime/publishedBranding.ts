import { prisma } from "@buildez/db";

const VALID_STATUSES = [
  "ACTIVE",
  "TRIALING",
];

function isPaidAmount(amount: number | null | undefined) {
  return typeof amount === "number" && amount > 0;
}

function isPaidPricingRow(pricing: { amount: number | null; billingCycle?: string | null }) {
  // A "custom" pricing row (Enterprise) has a display amount of 0 but is
  // never a free plan — treat it as paid so Enterprise tenants aren't
  // mistaken for free-tier when deciding badge visibility.
  return pricing.billingCycle === "custom" || isPaidAmount(pricing.amount);
}

async function isPaidAndConfirmed(input: { siteId: string; tenantId: string }) {
  /*
   * Site-specific paid subscription takes priority.
   */
  const siteSubscription =
    await prisma.siteSubscription.findFirst({
      where: {
        siteId: input.siteId,
        tenantId: input.tenantId,
        status: {
          in: VALID_STATUSES,
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        plan: {
          select: {
            pricing: {
              where: {
                isActive: true,
              },

              select: {
                amount: true,
                billingCycle: true,
              },
            },
          },
        },
      },
    });

  const hasPaidSitePlan =
    siteSubscription?.plan.pricing.some(
      (pricing) => isPaidPricingRow(pricing)
    ) ?? false;

  if (hasPaidSitePlan) {
    return true;
  }

  /*
   * Tenant-wide active paid subscription.
   *
   * currentPeriodEnd=null is allowed for legacy/manual subscriptions.
   * If currentPeriodEnd exists, it must still be valid.
   */
  const tenantSubscription =
    await prisma.subscription.findFirst({
      where: {
        tenantActiveId: input.tenantId,

        status: {
          in: VALID_STATUSES,
        },

        OR: [
          {
            currentPeriodEnd: null,
          },
          {
            currentPeriodEnd: {
              gt: new Date(),
            },
          },
        ],
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        amountPaid: true,
        paidAt: true,
        paymentStatus: true,

        Plan: {
          select: {
            pricing: {
              where: {
                isActive: true,
              },

              select: {
                amount: true,
                billingCycle: true,
              },
            },
          },
        },
      },
    });

  if (!tenantSubscription) {
    return false;
  }

  const paidPlanPrice =
    tenantSubscription.Plan?.pricing.some(
      (pricing) => isPaidPricingRow(pricing)
    ) ?? false;

  const paymentConfirmed =
    tenantSubscription.paymentStatus === "PAID" ||
    tenantSubscription.paymentStatus === "SUCCESS" ||
    Boolean(tenantSubscription.paidAt) ||
    isPaidAmount(tenantSubscription.amountPaid);

  return paidPlanPrice && paymentConfirmed;
}

/**
 * The "Powered by BuildEZ" badge is compulsory on free/trial sites — the
 * tenant's `Site.settings.showPoweredBy` toggle only has any effect once
 * the tenant is on a demonstrably paid, currently valid subscription.
 * (See SiteSettings.tsx / app/api/sites/[siteId]/settings for the toggle
 * itself, which is intentionally not plan-gated on write — this function
 * is the actual enforcement point.)
 */
export async function shouldShowBuildezBranding(input: {
  siteId: string;
  tenantId: string;
}) {
  const paid = await isPaidAndConfirmed(input);
  if (!paid) return true;

  const site = await prisma.site.findUnique({
    where: { id: input.siteId },
    select: { settings: true },
  });
  const settings =
    site?.settings && typeof site.settings === "object" && !Array.isArray(site.settings)
      ? (site.settings as Record<string, unknown>)
      : {};
  const showPoweredBy = settings.showPoweredBy !== false;

  return showPoweredBy;
}
