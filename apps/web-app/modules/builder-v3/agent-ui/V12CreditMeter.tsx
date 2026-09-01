"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

type V12CreditBalancePayload = {
  planCode: string | null;
  balance: {
    included: { remaining: number };
    topUp: { remaining: number };
    totalRemaining: number;
  };
};

export default function V12CreditMeter({ running }: { running: boolean }) {
  const [creditBalance, setCreditBalance] = useState<V12CreditBalancePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const previousRunningRef = useRef(running);

  async function loadCreditBalance() {
    setLoading(true);
    try {
      const response = await fetch("/api/builder-v3/credits", { cache: "no-store" });
      if (!response.ok) return;
      setCreditBalance(await response.json() as V12CreditBalancePayload);
    } catch {
      // The meter is informational and must not interrupt builder actions.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCreditBalance();
  }, []);

  useEffect(() => {
    const wasRunning = previousRunningRef.current;
    previousRunningRef.current = running;
    if (wasRunning && !running) void loadCreditBalance();
  }, [running]);

  const total = creditBalance?.balance.totalRemaining ?? 0;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label="View AI credit balance"
        title="AI credits"
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/35 hover:bg-violet-400/15"
      >
        <Sparkles size={12} aria-hidden="true" />
        {loading && !creditBalance
          ? <Loader2 size={12} className="animate-spin" />
          : <span className="tabular-nums">{total.toLocaleString()}</span>}
        <span className="text-[10px] font-medium text-violet-200/60">credits</span>
      </button>

      {expanded && (
        <div className="absolute left-0 top-9 z-[20000] w-56 overflow-hidden rounded-xl border border-white/10 bg-[#171b22] shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 px-3.5 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">AI Credits</div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="text-xl font-semibold tabular-nums text-white">{total.toLocaleString()}</div>
              {creditBalance?.planCode && <div className="pb-0.5 text-[10px] font-medium text-white/30">{creditBalance.planCode}</div>}
            </div>
          </div>
          <div className="space-y-2 px-3.5 py-3">
            <CreditBalanceRow label="Included" value={creditBalance?.balance.included.remaining ?? 0} />
            <CreditBalanceRow label="Top-up" value={creditBalance?.balance.topUp.remaining ?? 0} />
            <div className="border-t border-white/10 pt-2">
              <CreditBalanceRow label="Available" value={total} strong />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreditBalanceRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "text-[11px] font-semibold text-white/65" : "text-[11px] text-white/40"}>{label}</span>
      <span className={strong ? "text-[11px] font-semibold tabular-nums text-white" : "text-[11px] font-medium tabular-nums text-white/65"}>{value.toLocaleString()}</span>
    </div>
  );
}
