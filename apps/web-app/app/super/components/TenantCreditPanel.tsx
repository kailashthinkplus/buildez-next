"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Coins,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

type CreditBalance = {
  included: {
    limit: number;
    used: number;
    remaining: number;
    periodStart: string | null;
    periodEnd: string | null;
  };

  topUp: {
    remaining: number;
  };

  totalRemaining: number;
};

type LedgerEntry = {
  id: string;
  type: string;
  amount: number;
  planCredits: number;
  topUpCredits: number;
  planCode: string | null;
  reason: string | null;
  idempotencyKey: string;
  createdAt: string;
};

type Reservation = {
  id: string;
  reservationId: string;
  amount: number;
  planCreditsReserved: number;
  topUpCreditsReserved: number;
  status: string;
  releaseReason: string | null;
  createdAt: string;
  capturedAt: string | null;
  releasedAt: string | null;
};

type CreditPayload = {
  tenant: {
    id: string;
    name: string | null;
  };

  planCode: string | null;

  balance: CreditBalance;

  ledger: LedgerEntry[];

  reservations: Reservation[];
};

function integer(value: unknown) {
  const parsed =
    Number.parseInt(
      String(value ?? ""),
      10,
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function numberLabel(value: number) {
  return value.toLocaleString();
}

function dateLabel(value?: string | null) {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(undefined, { hour12: true });
}

function ledgerSign(
  entry: LedgerEntry,
) {
  switch (
    entry.type
  ) {
    case "TOPUP_GRANT":
    case "TOPUP_PURCHASE":
    case "ADMIN_ADJUSTMENT":
    case "RELEASE":
      return "+";

    case "RESERVE":
      return "−";

    default:
      return "";
  }
}

function statusClasses(
  status: string,
) {
  switch (
    status.toUpperCase()
  ) {
    case "CAPTURED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";

    case "RELEASED":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";

    case "RESERVED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";

    default:
      return "border dashboard-border dashboard-muted";
  }
}

export default function TenantCreditPanel({
  tenantId,
}: {
  tenantId: string;
}) {
  const [data, setData] =
    useState<CreditPayload | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [granting, setGranting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [grantAmount, setGrantAmount] =
    useState("500");

  const [reason, setReason] =
    useState(
      "Superadmin credit grant",
    );

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              `/api/super/credits?tenantId=${encodeURIComponent(
                tenantId,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          const body =
            await response.json();

          if (!response.ok) {
            throw new Error(
              body.error ||
                "Unable to load AI credits",
            );
          }

          setData(
            body as CreditPayload,
          );
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load AI credits",
          );
        } finally {
          setLoading(false);
        }
      },
      [tenantId],
    );

  useEffect(() => {
    void load();
  }, [load]);

  async function grantCredits() {
    if (granting) return;

    const amount =
      integer(grantAmount);

    if (amount <= 0) {
      setError(
        "Enter a positive credit amount.",
      );
      return;
    }

    setGranting(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/super/credits",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tenantId,
              amount,
              reason:
                reason.trim() ||
                "Superadmin credit grant",
            }),
          },
        );

      const body =
        await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ||
            "Unable to grant credits",
        );
      }

      setSuccess(
        `${numberLabel(
          amount,
        )} AI credits added`,
      );

      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to grant credits",
      );
    } finally {
      setGranting(false);
    }
  }

  if (loading && !data) {
    return (
      <section className="dashboard-card mt-6 flex h-56 items-center justify-center rounded-3xl">
        <Loader2 className="animate-spin dashboard-muted" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-600 dark:text-rose-300">
        {error ||
          "Unable to load AI credit information."}
      </section>
    );
  }

  const balance =
    data.balance;

  return (
    <div className="mt-6 space-y-6">
      <section className="dashboard-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <Coins size={20} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
                AI usage
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                AI Credits
              </h2>

              <p className="mt-1 text-sm dashboard-muted">
                {data.planCode ||
                  "No active plan"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={loading}
            className="dashboard-card inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Plan allowance"
            value={numberLabel(
              balance.included.limit,
            )}
            icon={
              <WalletCards
                size={16}
              />
            }
          />

          <Metric
            label="Used"
            value={numberLabel(
              balance.included.used,
            )}
            icon={
              <RotateCcw
                size={16}
              />
            }
          />

          <Metric
            label="Top-up remaining"
            value={numberLabel(
              balance.topUp.remaining,
            )}
            icon={<Plus size={16} />}
          />

          <Metric
            label="Total available"
            value={numberLabel(
              balance.totalRemaining,
            )}
            icon={
              <ShieldCheck
                size={16}
              />
            }
            emphasis
          />
        </div>

        <div className="mt-4 rounded-2xl border dashboard-border p-4">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs">
            <span className="dashboard-muted">
              Included credits remaining
            </span>

            <span className="font-semibold">
              {numberLabel(
                balance.included.remaining,
              )}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width]"
              style={{
                width: `${
                  balance.included.limit > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          (balance.included.remaining /
                            balance.included.limit) *
                            100,
                        ),
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] dashboard-faint">
            <span>
              Period start:{" "}
              {dateLabel(
                balance.included.periodStart,
              )}
            </span>

            <span>
              Period end:{" "}
              {dateLabel(
                balance.included.periodEnd,
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,.72fr)_minmax(0,1.28fr)]">
        <div className="dashboard-card rounded-3xl p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
            Superadmin
          </p>

          <h2 className="mt-1 text-lg font-semibold">
            Grant AI credits
          </h2>

          <p className="mt-2 text-sm leading-6 dashboard-muted">
            Adds persistent top-up credits that survive subscription-period resets.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-300">
              <Check size={14} />
              {success}
            </div>
          )}

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">
              Credits
            </span>

            <input
              type="number"
              min={1}
              step={1}
              value={grantAmount}
              onChange={(event) =>
                setGrantAmount(
                  event.target.value,
                )
              }
              className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold dashboard-muted">
              Reason
            </span>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value,
                )
              }
              rows={3}
              className="dashboard-input w-full resize-none rounded-xl px-3 py-2.5 text-sm"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              void grantCredits()
            }
            disabled={granting}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500 disabled:opacity-50"
          >
            {granting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Plus size={15} />
            )}

            {granting
              ? "Adding credits..."
              : "Add credits"}
          </button>
        </div>

        <div className="dashboard-card overflow-hidden rounded-3xl">
          <div className="border-b dashboard-border p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
              Audit
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Recent credit activity
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-xs">
              <thead className="border-b dashboard-border dashboard-faint">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    Event
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Amount
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Plan
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Top-up
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.ledger.length ? (
                  data.ledger.map(
                    (entry) => (
                      <tr
                        key={entry.id}
                        className="border-b dashboard-border last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-semibold">
                            {entry.type.replaceAll(
                              "_",
                              " ",
                            )}
                          </div>

                          {entry.reason && (
                            <div className="mt-1 max-w-[280px] truncate dashboard-muted">
                              {entry.reason}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono font-semibold">
                          {ledgerSign(
                            entry,
                          )}
                          {numberLabel(
                            entry.amount,
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {numberLabel(
                            entry.planCredits,
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {numberLabel(
                            entry.topUpCredits,
                          )}
                        </td>

                        <td className="px-5 py-3.5 dashboard-muted">
                          {dateLabel(
                            entry.createdAt,
                          )}
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center dashboard-muted"
                    >
                      No credit activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="dashboard-card overflow-hidden rounded-3xl">
        <div className="border-b dashboard-border p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
            Generations
          </p>

          <h2 className="mt-1 text-lg font-semibold">
            Credit reservations
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-left text-xs">
            <thead className="border-b dashboard-border dashboard-faint">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  Reservation
                </th>

                <th className="px-4 py-3 font-semibold">
                  Status
                </th>

                <th className="px-4 py-3 font-semibold">
                  Total
                </th>

                <th className="px-4 py-3 font-semibold">
                  Plan
                </th>

                <th className="px-4 py-3 font-semibold">
                  Top-up
                </th>

                <th className="px-5 py-3 font-semibold">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {data.reservations.length ? (
                data.reservations.map(
                  (reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b dashboard-border last:border-0"
                    >
                      <td className="px-5 py-3.5 font-mono">
                        {reservation.reservationId.slice(
                          0,
                          12,
                        )}
                        …
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses(
                            reservation.status,
                          )}`}
                        >
                          {reservation.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold">
                        {numberLabel(
                          reservation.amount,
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {numberLabel(
                          reservation.planCreditsReserved,
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {numberLabel(
                          reservation.topUpCreditsReserved,
                        )}
                      </td>

                      <td className="px-5 py-3.5 dashboard-muted">
                        {dateLabel(
                          reservation.createdAt,
                        )}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center dashboard-muted"
                  >
                    No persistent reservations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  emphasis = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        emphasis
          ? "border-blue-500/20 bg-blue-500/[.06]"
          : "dashboard-border bg-[var(--dashboard-surface)]"
      }`}
    >
      <div className="flex items-center gap-2 dashboard-faint">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-[-.03em]">
        {value}
      </div>
    </div>
  );
}
