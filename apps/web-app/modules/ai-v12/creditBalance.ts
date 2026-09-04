import { prisma } from "@buildez/db";

export async function getV12CreditBalance(input: {
  tenantId: string;
  creditLimit: number;
}) {
  // A subscription-webhook-driven bug (fixed alongside this) used to mint a
  // fresh PlanUsage row on every small drift in currentPeriodEnd instead of
  // reusing the row already covering "now", fragmenting one tenant's usage
  // across several overlapping rows. Summing every row that overlaps *now*
  // (rather than trusting the single latest-periodStart row) reports the
  // true total regardless of whether that fragmentation happened, and is a
  // no-op once a tenant only ever has one row per period going forward.
  const now = new Date();
  const currentUsageRows =
    await prisma.planUsage.findMany({
      where: {
        tenantId: input.tenantId,
        key: "ai_credits",
        periodStart: { lte: now },
        OR: [{ periodEnd: null }, { periodEnd: { gt: now } }],
      },
      orderBy: {
        periodStart: "desc",
      },
    });
  const currentUsage = currentUsageRows[0];

  const topUpUsage =
    await prisma.planUsage.findFirst({
      where: {
        tenantId: input.tenantId,
        key: "ai_credit_topup",
      },
      orderBy: {
        periodStart: "desc",
      },
    });

  const usedPlanCredits =
    Math.max(
      0,
      currentUsageRows.reduce((sum, row) => sum + row.used, 0),
    );

  const includedRemaining =
    Math.max(
      0,
      input.creditLimit -
      usedPlanCredits,
    );

  const topUpRemaining =
    Math.max(
      0,
      -(topUpUsage?.used || 0),
    );

  return {
    included: {
      limit:
        input.creditLimit,

      used:
        usedPlanCredits,

      remaining:
        includedRemaining,

      periodStart:
        currentUsage?.periodStart ||
        null,

      periodEnd:
        currentUsage?.periodEnd ||
        null,
    },

    topUp: {
      remaining:
        topUpRemaining,
    },

    totalRemaining:
      includedRemaining +
      topUpRemaining,
  };
}

export async function getV12CreditLedger(
  tenantId: string,
  limit = 100,
) {
  return prisma.aiCreditLedgerEntry.findMany({
    where: {
      tenantId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take:
      Math.min(
        Math.max(limit, 1),
        250,
      ),
  });
}
