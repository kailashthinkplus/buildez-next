import { randomUUID } from "node:crypto";

import {
  prisma,
  Prisma,
} from "@buildez/db";

import {
  requireSuperAdmin,
  superAdminErrorResponse,
} from "@/lib/superadmin/auth";

import { getTenantPlan } from "@/lib/plan/getPlan";

import {
  addV12TopUpCredits,
} from "@/modules/ai-v12/creditAccounting";

import {
  getV12CreditBalance,
  getV12CreditLedger,
} from "@/modules/ai-v12/creditBalance";

export async function GET(
  req: Request,
) {
  try {
    await requireSuperAdmin(req);

    const url =
      new URL(req.url);

    const tenantId =
      String(
        url.searchParams.get(
          "tenantId",
        ) || "",
      ).trim();

    if (!tenantId) {
      return Response.json(
        {
          error:
            "Tenant ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const tenant =
      await prisma.tenant.findUnique({
        where: {
          id:
            tenantId,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!tenant) {
      return Response.json(
        {
          error:
            "Tenant not found",
        },
        {
          status: 404,
        },
      );
    }

    const tenantPlan =
      await getTenantPlan(
        tenantId,
      );

    const creditLimit =
      typeof tenantPlan?.plan
        ?.aiCredits === "number"
        ? tenantPlan.plan
            .aiCredits
        : 0;

    const [
      balance,
      ledger,
      reservations,
    ] =
      await Promise.all([
        getV12CreditBalance({
          tenantId,
          creditLimit,
        }),

        getV12CreditLedger(
          tenantId,
          100,
        ),

        prisma.aiCreditReservation
          .findMany({
            where: {
              tenantId,
            },

            orderBy: {
              createdAt:
                "desc",
            },

            take: 50,
          }),
      ]);

    return Response.json({
      tenant,

      planCode:
        tenantPlan?.plan?.code ||
        tenantPlan?.subscription
          ?.planCode ||
        null,

      balance,
      ledger,
      reservations,
    });
  } catch (error) {
    return superAdminErrorResponse(
      error,
    );
  }
}

export async function POST(
  req: Request,
) {
  try {
    const actor =
      await requireSuperAdmin(req);

    const body =
      await req.json();

    const tenantId =
      String(
        body.tenantId || "",
      ).trim();

    const amount =
      Math.max(
        0,
        Math.floor(
          Number(
            body.amount || 0,
          ),
        ),
      );

    const reason =
      String(
        body.reason ||
          "Superadmin credit grant",
      ).trim();

    if (
      !tenantId ||
      amount <= 0
    ) {
      return Response.json(
        {
          error:
            "Tenant and positive credit amount are required",
        },
        {
          status: 400,
        },
      );
    }

    const tenant =
      await prisma.tenant.findUnique({
        where: {
          id: tenantId,
        },

        select: {
          id: true,
        },
      });

    if (!tenant) {
      return Response.json(
        {
          error:
            "Tenant not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * The browser should supply one stable key per grant action.
     *
     * Keep a server-generated fallback for older clients, but payment
     * callbacks and current Superadmin UI should always supply one.
     */
    const idempotencyKey =
      String(
        body.idempotencyKey ||
          `superadmin:${randomUUID()}`,
      ).trim();

    /*
     * Optional fast-path.
     *
     * This is NOT the authoritative idempotency mechanism; the unique
     * database constraint below remains the concurrency-safe guard.
     */
    const existing =
      await prisma.aiCreditLedgerEntry.findUnique({
        where: {
          idempotencyKey,
        },
      });

    if (existing) {
      return Response.json({
        ok: true,
        duplicate: true,
        amount:
          existing.amount,
        ledgerEntry:
          existing,
      });
    }

    try {
      const result =
        await prisma.$transaction(
          async (tx) => {
            /*
             * Create the unique ledger entry FIRST.
             *
             * If another request with the same key wins concurrently,
             * this insert fails and the whole transaction rolls back.
             */
            const ledgerEntry =
              await tx.aiCreditLedgerEntry.create({
                data: {
                  tenantId,

                  type:
                    "TOPUP_GRANT",

                  amount,

                  planCredits:
                    0,

                  topUpCredits:
                    amount,

                  reason,

                  idempotencyKey,

                  metadata: {
                    grantedBy:
                      actor.email ||
                      actor.id,
                  },
                },
              });

            /*
             * Balance mutation now participates in this SAME Prisma
             * transaction.
             */
            await addV12TopUpCredits(
              {
                tenantId,
                amount,
              },
              tx,
            );

            await tx.systemNotification.create({
              data: {
                type:
                  "SUPERADMIN_AI_CREDIT_GRANT",

                title:
                  "AI credits granted",

                message:
                  `${actor.email || actor.id} granted ${amount} AI credits`,

                entityType:
                  "Tenant",

                entityId:
                  tenantId,
              },
            });

            return ledgerEntry;
          },
        );

      return Response.json({
        ok: true,
        duplicate: false,
        amount,
        ledgerEntry:
          result,
      });
    } catch (error) {
      /*
       * Database unique constraint is the authoritative concurrency
       * guard. Two simultaneous requests with the same key can both
       * pass the pre-flight lookup, but only one transaction can insert
       * the ledger row.
       */
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const duplicate =
          await prisma.aiCreditLedgerEntry.findUnique({
            where: {
              idempotencyKey,
            },
          });

        if (duplicate) {
          return Response.json({
            ok: true,
            duplicate: true,
            amount:
              duplicate.amount,
            ledgerEntry:
              duplicate,
          });
        }
      }

      throw error;
    }
  } catch (error) {
    return superAdminErrorResponse(
      error,
    );
  }
}

