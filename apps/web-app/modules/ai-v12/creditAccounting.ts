import { randomUUID } from "node:crypto";

import {
  prisma,
  type Prisma,
} from "@buildez/db";

import { ApiError } from "@/lib/api/errors";

export type V12CreditReservation = {
  id: string;

  tenantId: string;
  userId?: string;
  siteId?: string;

  planCode: string;

  /**
   * Total commercial BuildEZ credits requested.
   */
  amount: number;

  /**
   * Exact funding split captured during reserve().
   *
   * These values are required so a technical failure can return
   * credits to the same buckets they originally came from.
   */
  planCreditsReserved: number;
  topUpCreditsReserved: number;

  planUsageId?: string;
  topUpUsageId?: string;

  enforced: boolean;

  /**
   * In-request idempotency protection.
   *
   * The same reservation must never be captured/released twice by
   * overlapping error/finalization paths.
   */
  state:
    | "shadow"
    | "reserved"
    | "captured"
    | "released";
};

function enforcementEnabled() {
  const configured =
    process.env.BUILDEZ_AI_CREDIT_ENFORCEMENT
      ?.trim()
      .toLowerCase();

  /*
   * Charging is the safe production default. Shadow accounting must be an
   * explicit operational choice; previously a missing environment variable
   * silently made every successful generation free.
   */
  return configured !== "false";
}

async function logCreditEvent(input: {
  tenantId: string;
  userId?: string;
  siteId?: string;

  action: string;

  reservationId: string;
  amount: number;
  planCode: string;
}) {
  await prisma.aiEvent.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      siteId: input.siteId,

      action: input.action,

      prompt: JSON.stringify({
        reservationId: input.reservationId,
        amount: input.amount,
        planCode: input.planCode,
      }),

      model: "buildez-credit-engine",

      tokensIn: 0,
      tokensOut: 0,

      status: "success",
    },
  });
}


type CreditPeriod = {
  periodStart: Date;
  periodEnd: Date | null;
  billingCycle: string | null;
};

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function addUtcMonths(
  value: Date,
  months: number,
) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth() + months,
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds(),
    ),
  );
}

function addUtcYears(
  value: Date,
  years: number,
) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear() + years,
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds(),
    ),
  );
}

function resolveCreditPeriod(input: {
  billingCycle?: string | null;
  startedAt?: Date | null;
  currentPeriodEnd?: Date | null;
}): CreditPeriod {
  const now = new Date();

  const cycle = String(
    input.billingCycle || "monthly",
  )
    .trim()
    .toLowerCase();

  /*
   * Prefer provider/current subscription boundaries when available.
   */
  if (input.currentPeriodEnd) {
    const end =
      input.currentPeriodEnd;

    const start =
      cycle === "yearly" ||
      cycle === "annual"
        ? addUtcYears(end, -1)
        : addUtcMonths(end, -1);

    return {
      periodStart: start,
      periodEnd: end,
      billingCycle: cycle,
    };
  }

  /*
   * Fall back to the subscription start anchor.
   */
  if (input.startedAt) {
    const anchor =
      input.startedAt;

    let start = new Date(anchor);
    let end =
      cycle === "yearly" ||
      cycle === "annual"
        ? addUtcYears(start, 1)
        : addUtcMonths(start, 1);

    while (end <= now) {
      start = end;
      end =
        cycle === "yearly" ||
        cycle === "annual"
          ? addUtcYears(start, 1)
          : addUtcMonths(start, 1);
    }

    return {
      periodStart: start,
      periodEnd: end,
      billingCycle: cycle,
    };
  }

  /*
   * Final safe fallback for legacy subscriptions.
   * Monthly periods align to UTC calendar months.
   */
  const monthStart =
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
      ),
    );

  return {
    periodStart:
      startOfUtcDay(monthStart),

    periodEnd:
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() + 1,
          1,
        ),
      ),

    billingCycle:
      "monthly",
  };
}

async function getTenantCreditPeriod(
  tenantId: string,
): Promise<CreditPeriod> {
  const subscription =
    await prisma.subscription.findFirst({
      where: {
        tenantActiveId: tenantId,
        status: "ACTIVE",
      },
      select: {
        billingCycle: true,
        startedAt: true,
        currentPeriodEnd: true,
      },
    });

  return resolveCreditPeriod({
    billingCycle:
      subscription?.billingCycle,
    startedAt:
      subscription?.startedAt,
    currentPeriodEnd:
      subscription?.currentPeriodEnd,
  });
}

async function getCurrentCreditUsage(
  tenantId: string,
) {
  const period =
    await getTenantCreditPeriod(
      tenantId,
    );

  return prisma.planUsage.upsert({
    where: {
      tenantId_key_periodStart: {
        tenantId,
        key: "ai_credits",
        periodStart:
          period.periodStart,
      },
    },

    update: {
      periodEnd:
        period.periodEnd,

      billingCycle:
        period.billingCycle,
    },

    create: {
      tenantId,
      key: "ai_credits",
      used: 0,

      billingCycle:
        period.billingCycle,

      periodStart:
        period.periodStart,

      periodEnd:
        period.periodEnd,
    },
  });
}

/**
 * Top-up credits are deliberately stored separately from monthly
 * plan usage so purchased credits do not disappear when the
 * subscription cycle rolls over.
 */
type CreditDbClient =
  Pick<
    Prisma.TransactionClient,
    "planUsage"
  >;

async function getTopUpUsage(
  tenantId: string,
  client: CreditDbClient = prisma,
) {
  const epoch =
    new Date(
      Date.UTC(2000, 0, 1),
    );

  return client.planUsage.upsert({
    where: {
      tenantId_key_periodStart: {
        tenantId,
        key: "ai_credit_topup",
        periodStart: epoch,
      },
    },

    update: {},

    create: {
      tenantId,
      key: "ai_credit_topup",
      used: 0,

      billingCycle:
        "lifetime",

      periodStart:
        epoch,

      periodEnd:
        null,
    },
  });
}

export async function addV12TopUpCredits(
  input: {
    tenantId: string;
    amount: number;
  },
  client: CreditDbClient = prisma,
) {
  const amount =
    Math.max(
      0,
      Math.floor(input.amount),
    );

  if (!amount) return;

  const bucket =
    await getTopUpUsage(
      input.tenantId,
      client,
    );

  /*
   * Top-up row stores AVAILABLE purchased credits as a negative
   * consumption balance.
   *
   * Example:
   * used = -500 means 500 purchased credits remain.
   */
  await client.planUsage.update({
    where: {
      id: bucket.id,
    },

    data: {
      used: {
        decrement:
          amount,
      },
    },
  });
}

async function reserveTopUpCredits(
  tenantId: string,
  amount: number,
) {
  if (amount <= 0) {
    return {
      amount: 0,
      usageId: undefined as string | undefined,
    };
  }

  const bucket =
    await getTopUpUsage(
      tenantId,
    );

  /*
   * Purchased credits are stored as a negative used balance.
   *
   * Example:
   *
   * used = -500
   * amount = 120
   *
   * Reservation is allowed only while:
   *
   * used <= -120
   *
   * resulting value:
   *
   * -500 + 120 = -380
   *
   * updateMany makes this conditional mutation atomic for competing
   * requests sharing the same top-up balance.
   */
  const result =
    await prisma.planUsage.updateMany({
      where: {
        id: bucket.id,

        used: {
          lte:
            -amount,
        },
      },

      data: {
        used: {
          increment:
            amount,
        },
      },
    });

  if (result.count !== 1) {
    return {
      amount: 0,
      usageId: bucket.id,
    };
  }

  return {
    amount,
    usageId: bucket.id,
  };
}

/**
 * Reserve credits BEFORE expensive generation begins.
 *
 * Reservation works by atomically incrementing the current
 * PlanUsage row.
 *
 * Because the update includes a `used <= remaining-capacity`
 * condition, concurrent requests cannot both spend the same
 * remaining credits.
 */

export async function reserveV12Credits(input: {
  tenantId: string;
  userId?: string;
  siteId?: string;

  planCode: string;

  creditLimit?: number | null;

  amount: number;
}): Promise<V12CreditReservation> {
  const amount =
    Math.max(
      0,
      Math.ceil(input.amount),
    );

  const enforced =
    enforcementEnabled();

  const reservation: V12CreditReservation = {
    id: randomUUID(),

    tenantId:
      input.tenantId,

    userId:
      input.userId,

    siteId:
      input.siteId,

    planCode:
      input.planCode || "FREE",

    amount,

    planCreditsReserved: 0,
    topUpCreditsReserved: 0,

    enforced,

    state:
      enforced
        ? "reserved"
        : "shadow",
  };

  /* Explicit shadow mode intentionally performs no balance mutations. */
  if (!enforced) {
    console.log(
      "V12 CREDIT RESERVATION [SHADOW]:",
      {
        reservationId:
          reservation.id,

        planCode:
          reservation.planCode,

        amount,
      },
    );

    return reservation;
  }

  if (amount <= 0) {
    return reservation;
  }

  const limit =
    typeof input.creditLimit === "number"
      ? Math.max(
          0,
          Math.floor(
            input.creditLimit,
          ),
        )
      : null;

  if (limit === null) {
    throw new ApiError(
      "AI credits are unavailable for the current plan.",
      403,
      "AI_CREDITS_NOT_CONFIGURED",
    );
  }

  const period =
    await getTenantCreditPeriod(
      input.tenantId,
    );

  const topUpEpoch =
    new Date(
      Date.UTC(2000, 0, 1),
    );

  try {
    const persisted =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Get/create the current subscription-period usage row.
           */
          const planUsage =
            await tx.planUsage.upsert({
              where: {
                tenantId_key_periodStart: {
                  tenantId:
                    input.tenantId,

                  key:
                    "ai_credits",

                  periodStart:
                    period.periodStart,
                },
              },

              update: {
                periodEnd:
                  period.periodEnd,

                billingCycle:
                  period.billingCycle,
              },

              create: {
                tenantId:
                  input.tenantId,

                key:
                  "ai_credits",

                used:
                  0,

                billingCycle:
                  period.billingCycle,

                periodStart:
                  period.periodStart,

                periodEnd:
                  period.periodEnd,
              },
            });

          const topUpUsage =
            await tx.planUsage.upsert({
              where: {
                tenantId_key_periodStart: {
                  tenantId:
                    input.tenantId,

                  key:
                    "ai_credit_topup",

                  periodStart:
                    topUpEpoch,
                },
              },

              update: {},

              create: {
                tenantId:
                  input.tenantId,

                key:
                  "ai_credit_topup",

                used:
                  0,

                billingCycle:
                  "lifetime",

                periodStart:
                  topUpEpoch,

                periodEnd:
                  null,
              },
            });

          /*
           * Included plan credits are always consumed first.
           */
          const availablePlanCredits =
            Math.max(
              0,
              limit -
              planUsage.used,
            );

          const desiredPlanCredits =
            Math.min(
              amount,
              availablePlanCredits,
            );

          let planCreditsReserved =
            0;

          if (desiredPlanCredits > 0) {
            const planResult =
              await tx.planUsage.updateMany({
                where: {
                  id:
                    planUsage.id,

                  used: {
                    lte:
                      limit -
                      desiredPlanCredits,
                  },
                },

                data: {
                  used: {
                    increment:
                      desiredPlanCredits,
                  },
                },
              });

            if (
              planResult.count === 1
            ) {
              planCreditsReserved =
                desiredPlanCredits;
            }
          }

          const remainingAmount =
            amount -
            planCreditsReserved;

          let topUpCreditsReserved =
            0;

          if (remainingAmount > 0) {
            /*
             * Top-up availability is represented by negative `used`.
             *
             * -500 = 500 credits remaining.
             *
             * Conditional update makes concurrent reservations safe.
             */
            const topUpResult =
              await tx.planUsage.updateMany({
                where: {
                  id:
                    topUpUsage.id,

                  used: {
                    lte:
                      -remainingAmount,
                  },
                },

                data: {
                  used: {
                    increment:
                      remainingAmount,
                  },
                },
              });

            if (
              topUpResult.count === 1
            ) {
              topUpCreditsReserved =
                remainingAmount;
            }
          }

          const totalReserved =
            planCreditsReserved +
            topUpCreditsReserved;

          if (
            totalReserved !==
            amount
          ) {
            /*
             * Throwing inside this transaction rolls back BOTH usage
             * buckets automatically.
             */
            throw new ApiError(
              "You do not have enough AI credits for this generation.",
              429,
              "AI_CREDITS_EXCEEDED",
            );
          }

          /*
           * Persist reservation state in the SAME transaction as
           * the balance mutations.
           */
          const reservationRecord =
            await tx.aiCreditReservation.create({
              data: {
                reservationId:
                  reservation.id,

                tenantId:
                  input.tenantId,

                userId:
                  input.userId,

                siteId:
                  input.siteId,

                planCode:
                  reservation.planCode,

                amount,

                planCreditsReserved,

                topUpCreditsReserved,

                planUsageId:
                  planUsage.id,

                topUpUsageId:
                  topUpUsage.id,

                status:
                  "RESERVED",
              },
            });

          await tx.aiCreditLedgerEntry.create({
            data: {
              tenantId:
                input.tenantId,

              reservationId:
                reservation.id,

              type:
                "RESERVE",

              amount,

              planCredits:
                planCreditsReserved,

              topUpCredits:
                topUpCreditsReserved,

              planCode:
                reservation.planCode,

              idempotencyKey:
                `reservation:${reservation.id}:reserve`,

              metadata: {
                planUsageId:
                  planUsage.id,

                topUpUsageId:
                  topUpUsage.id,
              },
            },
          });

          return {
            reservationRecord,

            planCreditsReserved,
            topUpCreditsReserved,

            planUsageId:
              planUsage.id,

            topUpUsageId:
              topUpUsage.id,
          };
        },
      );

    reservation.planCreditsReserved =
      persisted.planCreditsReserved;

    reservation.topUpCreditsReserved =
      persisted.topUpCreditsReserved;

    reservation.planUsageId =
      persisted.planUsageId;

    reservation.topUpUsageId =
      persisted.topUpUsageId;

    await logCreditEvent({
      tenantId:
        input.tenantId,

      userId:
        input.userId,

      siteId:
        input.siteId,

      action:
        "v12_credit_reserved",

      reservationId:
        reservation.id,

      amount,

      planCode:
        reservation.planCode,
    });

    console.log(
      "V12 CREDIT RESERVED:",
      {
        reservationId:
          reservation.id,

        total:
          amount,

        fromPlan:
          reservation.planCreditsReserved,

        fromTopUp:
          reservation.topUpCreditsReserved,
      },
    );

    return reservation;
  } catch (error) {
    /*
     * ApiError should pass through unchanged so the API can expose the
     * appropriate credit-exceeded status.
     */
    throw error;
  }
}


/**
 * Capture finalizes an already funded persistent reservation.
 *
 * No PlanUsage mutation occurs because reserve() already removed
 * credits from availability.
 */
export async function captureV12Credits(
  reservation: V12CreditReservation,
) {
  if (!reservation.enforced) {
    reservation.state =
      "captured";

    console.log(
      "V12 CREDIT CAPTURE [SHADOW]:",
      {
        reservationId:
          reservation.id,

        amount:
          reservation.amount,
      },
    );

    return;
  }

  const captured =
    await prisma.$transaction(
      async (tx) => {
        /*
         * Only RESERVED → CAPTURED is allowed.
         *
         * updateMany gives us a database-level idempotency gate.
         */
        const transition =
          await tx.aiCreditReservation.updateMany({
            where: {
              reservationId:
                reservation.id,

              status:
                "RESERVED",
            },

            data: {
              status:
                "CAPTURED",

              capturedAt:
                new Date(),
            },
          });

        if (
          transition.count !== 1
        ) {
          return false;
        }

        await tx.aiCreditLedgerEntry.create({
          data: {
            tenantId:
              reservation.tenantId,

            reservationId:
              reservation.id,

            type:
              "CAPTURE",

            amount:
              reservation.amount,

            planCredits:
              reservation.planCreditsReserved,

            topUpCredits:
              reservation.topUpCreditsReserved,

            planCode:
              reservation.planCode,

            idempotencyKey:
              `reservation:${reservation.id}:capture`,
          },
        });

        return true;
      },
    );

  if (!captured) {
    const persisted =
      await prisma.aiCreditReservation.findUnique({
        where: {
          reservationId:
            reservation.id,
        },

        select: {
          status: true,
        },
      });

    reservation.state =
      persisted?.status === "RELEASED"
        ? "released"
        : "captured";

    console.log(
      "V12 CREDIT CAPTURE SKIPPED:",
      {
        reservationId:
          reservation.id,

        persistedStatus:
          persisted?.status ||
          "missing",
      },
    );

    return;
  }

  reservation.state =
    "captured";

  await logCreditEvent({
    tenantId:
      reservation.tenantId,

    userId:
      reservation.userId,

    siteId:
      reservation.siteId,

    action:
      "v12_credit_captured",

    reservationId:
      reservation.id,

    amount:
      reservation.amount,

    planCode:
      reservation.planCode,
  });

  console.log(
    "V12 CREDIT CAPTURED:",
    {
      reservationId:
        reservation.id,

      total:
        reservation.amount,

      fromPlan:
        reservation.planCreditsReserved,

      fromTopUp:
        reservation.topUpCreditsReserved,
    },
  );
}


/**
 * Release returns credits to their ORIGINAL buckets.
 *
 * Persistent RESERVED → RELEASED transition makes this idempotent
 * across duplicated API cleanup paths and server retries.
 */
export async function releaseV12Credits(
  reservation: V12CreditReservation,
  reason = "technical_failure",
) {
  if (!reservation.enforced) {
    if (
      reservation.state ===
      "released"
    ) {
      return;
    }

    reservation.state =
      "released";

    console.log(
      "V12 CREDIT RELEASE [SHADOW]:",
      {
        reservationId:
          reservation.id,

        amount:
          reservation.amount,

        reason,
      },
    );

    return;
  }

  const released =
    await prisma.$transaction(
      async (tx) => {
        const record =
          await tx.aiCreditReservation.findUnique({
            where: {
              reservationId:
                reservation.id,
            },
          });

        if (
          !record ||
          record.status !== "RESERVED"
        ) {
          return false;
        }

        /*
         * Transition first inside the transaction.
         *
         * Any subsequent refund failure rolls the whole transaction
         * back to RESERVED automatically.
         */
        const transition =
          await tx.aiCreditReservation.updateMany({
            where: {
              reservationId:
                reservation.id,

              status:
                "RESERVED",
            },

            data: {
              status:
                "RELEASED",

              releaseReason:
                reason,

              releasedAt:
                new Date(),
            },
          });

        if (
          transition.count !== 1
        ) {
          return false;
        }

        if (
          record.planCreditsReserved >
            0 &&
          record.planUsageId
        ) {
          const refund =
            await tx.planUsage.updateMany({
              where: {
                id:
                  record.planUsageId,

                used: {
                  gte:
                    record.planCreditsReserved,
                },
              },

              data: {
                used: {
                  decrement:
                    record.planCreditsReserved,
                },
              },
            });

          if (
            refund.count !== 1
          ) {
            throw new Error(
              `Unable to refund plan credits for reservation ${reservation.id}`,
            );
          }
        }

        if (
          record.topUpCreditsReserved >
            0 &&
          record.topUpUsageId
        ) {
          /*
           * Purchased credits use a negative available balance.
           *
           * Refund:
           * -400 → -500
           */
          await tx.planUsage.update({
            where: {
              id:
                record.topUpUsageId,
            },

            data: {
              used: {
                decrement:
                  record.topUpCreditsReserved,
              },
            },
          });
        }

        await tx.aiCreditLedgerEntry.create({
          data: {
            tenantId:
              record.tenantId,

            reservationId:
              reservation.id,

            type:
              "RELEASE",

            amount:
              record.amount,

            planCredits:
              record.planCreditsReserved,

            topUpCredits:
              record.topUpCreditsReserved,

            planCode:
              record.planCode,

            reason,

            idempotencyKey:
              `reservation:${reservation.id}:release`,
          },
        });

        return true;
      },
    );

  if (!released) {
    const persisted =
      await prisma.aiCreditReservation.findUnique({
        where: {
          reservationId:
            reservation.id,
        },

        select: {
          status: true,
        },
      });

    reservation.state =
      persisted?.status === "CAPTURED"
        ? "captured"
        : "released";

    console.log(
      "V12 CREDIT RELEASE SKIPPED:",
      {
        reservationId:
          reservation.id,

        reason,

        persistedStatus:
          persisted?.status ||
          "missing",
      },
    );

    return;
  }

  reservation.state =
    "released";

  await logCreditEvent({
    tenantId:
      reservation.tenantId,

    userId:
      reservation.userId,

    siteId:
      reservation.siteId,

    action:
      `v12_credit_released:${reason}`,

    reservationId:
      reservation.id,

    amount:
      reservation.amount,

    planCode:
      reservation.planCode,
  });

  console.log(
    "V12 CREDIT RELEASED:",
    {
      reservationId:
        reservation.id,

      reason,

      total:
        reservation.amount,

      toPlan:
        reservation.planCreditsReserved,

      toTopUp:
        reservation.topUpCreditsReserved,
    },
  );
}
