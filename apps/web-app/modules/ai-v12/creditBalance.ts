import { prisma } from "@buildez/db";

export async function getV12CreditBalance(input: {
  tenantId: string;
  creditLimit: number;
}) {
  const currentUsage =
    await prisma.planUsage.findFirst({
      where: {
        tenantId: input.tenantId,
        key: "ai_credits",
      },
      orderBy: {
        periodStart: "desc",
      },
    });

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
      currentUsage?.used || 0,
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
