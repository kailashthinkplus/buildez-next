"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, RotateCcw, Timer } from "lucide-react";

type ScopeRow = {
  scope: string;
  label: string;
  limit: number;
  used: number;
  resetAt: string | null;
  exceeded: boolean;
};

type Payload = {
  user: { id: string; email: string | null; name: string | null };
  planCode: string | null;
  scopes: ScopeRow[];
};

function dateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function RateLimitPanel({ userId }: { userId: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/super/rate-limits?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load rate limits");
      setData(body as Payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load rate limits");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function reset(scope: string) {
    if (resetting) return;
    setResetting(scope);
    setError("");
    try {
      const response = await fetch("/api/super/rate-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, scope }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to reset rate limit");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reset rate limit");
    } finally {
      setResetting(null);
    }
  }

  if (loading && !data) {
    return (
      <section className="dashboard-card mt-6 flex h-40 items-center justify-center rounded-3xl">
        <Loader2 className="animate-spin dashboard-muted" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-600 dark:text-rose-300">
        {error || "Unable to load rate limit information."}
      </section>
    );
  }

  return (
    <section className="dashboard-card mt-6 rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Timer size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">AI guardrails</p>
            <h2 className="mt-1 text-xl font-semibold">Rate limits</h2>
            <p className="mt-1 text-sm dashboard-muted">{data.planCode || "No active plan"} · limits shown are hourly, per user</p>
          </div>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="dashboard-card inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {data.scopes.map((row) => (
          <div
            key={row.scope}
            className={`rounded-2xl border p-4 ${row.exceeded ? "border-rose-500/30 bg-rose-500/[.06]" : "dashboard-border bg-[var(--dashboard-surface)]"}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{row.label}</span>
              {row.exceeded && <AlertTriangle size={13} className="text-rose-500" />}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-[-.03em]">
              {row.used}
              <span className="text-sm font-normal dashboard-muted"> / {row.limit}</span>
            </div>
            <p className="mt-1 text-[11px] dashboard-faint">Resets {dateLabel(row.resetAt)}</p>
            <button
              onClick={() => void reset(row.scope)}
              disabled={resetting === row.scope}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border dashboard-border px-3 py-2 text-xs font-semibold dashboard-hover disabled:opacity-50"
            >
              {resetting === row.scope ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              Reset now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
