import { prisma } from "@buildez/db";

const VALID_STATUSES = [
  "ACTIVE",
  "TRIALING",
];

function isPaidAmount(amount: number | null | undefined) {
  return typeof amount === "number" && amount > 0;
}

export async function shouldShowBuildezBranding(input: {
  siteId: string;
  tenantId: string;
}) {
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
        planCode: true,

        plan: {
          select: {
            pricing: {
              where: {
                isActive: true,
              },

              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

  const hasPaidSitePlan =
    siteSubscription?.plan.pricing.some(
      (pricing) => isPaidAmount(pricing.amount)
    ) ?? false;

  if (hasPaidSitePlan) {
    return false;
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
              },
            },
          },
        },
      },
    });

  if (!tenantSubscription) {
    return true;
  }

  const paidPlanPrice =
    tenantSubscription.Plan?.pricing.some(
      (pricing) => isPaidAmount(pricing.amount)
    ) ?? false;

  const paymentConfirmed =
    tenantSubscription.paymentStatus === "PAID" ||
    tenantSubscription.paymentStatus === "SUCCESS" ||
    Boolean(tenantSubscription.paidAt) ||
    isPaidAmount(tenantSubscription.amountPaid);

  /*
   * Branding disappears ONLY when this is demonstrably a paid,
   * currently valid subscription.
   */
  return !(paidPlanPrice && paymentConfirmed);
}
