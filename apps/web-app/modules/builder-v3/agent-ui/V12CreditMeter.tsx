"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { CreditsDropdown } from "@/modules/dashboard/CreditsDropdown";

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
        <div className="absolute left-0 top-9 z-[20000] w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#171b22] shadow-2xl shadow-black/50">
          <CreditsDropdown dark />
        </div>
      )}
    </div>
  );
}
