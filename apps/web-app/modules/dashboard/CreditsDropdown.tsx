"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Crown, Plus } from "lucide-react";

type CreditBalance = {
  included: { limit: number; used: number; remaining: number };
  topUp: { remaining: number };
  totalRemaining: number;
};

type UsageStatValue = { label: string; used?: number; total?: number };

/*
 * The one credit-balance dropdown body shared by the tenant dashboard
 * header and the builder header, so both surfaces show the same numbers
 * in the same layout. `dark` swaps the dashboard's theme-aware CSS vars
 * for the builder's fixed dark palette — the builder route never toggles
 * light/dark, so it can't rely on the `--dashboard-*` custom properties
 * resolving to dark colors.
 */
export function CreditsDropdown({
  dark = false,
  usageStats,
}: {
  dark?: boolean;
  usageStats?: UsageStatValue[];
}) {
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/builder-v3/credits", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.balance) setCreditBalance(payload.balance);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const faintText = dark ? "text-white/35" : "dashboard-faint";
  const mutedText = dark ? "text-white/50" : "dashboard-muted";
  const borderClass = dark ? "border-white/10" : "border dashboard-border";
  const trackClass = dark ? "bg-white/10" : "bg-slate-200 dark:bg-white/10";
  const ghostButton = dark
    ? "border border-white/10 text-white/80 hover:bg-white/10"
    : "border dashboard-border dashboard-hover";

  return (
    <div className={dark ? "text-white" : undefined}>
      <div className="px-4 py-3">
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${faintText}`}>
          <Coins size={12} /> AI credits
        </div>
        {creditBalance ? (
          <>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold">
                {creditBalance.totalRemaining.toLocaleString()}
              </span>
              <span className={`text-xs ${mutedText}`}>remaining</span>
            </div>
            <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${trackClass}`}>
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${
                    creditBalance.included.limit > 0
                      ? Math.min(100, Math.max(0, (creditBalance.included.remaining / creditBalance.included.limit) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className={`mt-1.5 text-[10px] ${faintText}`}>
              {creditBalance.included.remaining.toLocaleString()} of {creditBalance.included.limit.toLocaleString()} plan credits · {creditBalance.topUp.remaining.toLocaleString()} top-up
            </p>
          </>
        ) : (
          <p className={`mt-1.5 text-xs ${mutedText}`}>Loading…</p>
        )}
      </div>

      {usageStats && usageStats.length > 0 && (
        <div className={`grid grid-cols-2 gap-3 border-t ${borderClass} px-4 py-3`}>
          {usageStats.map((stat) => (
            <div key={stat.label}>
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${faintText}`}>{stat.label}</p>
              <p className="mt-1 text-sm font-semibold">
                {typeof stat.used === "number" ? stat.used.toLocaleString() : "—"}
                <span className={`text-xs font-normal ${mutedText}`}>
                  {" "}/ {typeof stat.total === "number" ? stat.total.toLocaleString() : "—"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className={`flex gap-2 border-t ${borderClass} p-3`}>
        <Link
          href="/app/workspace/billing#ai-credits"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${ghostButton}`}
        >
          <Plus size={13} /> Add credits
        </Link>
        <Link
          href="/app/workspace/billing?upgrade=1"
          className={
            dark
              ? "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              : "dashboard-primary-button flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white"
          }
        >
          <Crown size={13} /> Upgrade
        </Link>
      </div>
    </div>
  );
}
