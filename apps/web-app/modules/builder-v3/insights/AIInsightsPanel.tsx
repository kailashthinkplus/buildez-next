"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  Check,
  ChevronRight,
  Globe2,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  InsightCategoryId,
  InsightFinding,
  InsightReport,
} from "@/modules/insights/types";

const icons: Record<InsightCategoryId, LucideIcon> = {
  seo: Search,
  geo: Globe2,
  performance: Zap,
  accessibility: Accessibility,
  conversion: MousePointerClick,
  "best-practices": ShieldCheck,
};

const tones: Record<InsightCategoryId, string> = {
  seo: "bg-blue-500/15 text-blue-300",
  geo: "bg-violet-500/15 text-violet-300",
  performance: "bg-amber-500/15 text-amber-300",
  accessibility: "bg-cyan-500/15 text-cyan-300",
  conversion: "bg-emerald-500/15 text-emerald-300",
  "best-practices": "bg-rose-500/15 text-rose-300",
};

export function AIInsightsPanel({
  siteId,
  pageId,
  pageTitle,
  refreshKey,
  onFix,
  onClose,
}: {
  siteId: string;
  pageId?: string;
  pageTitle?: string;
  refreshKey?: number;
  onFix: (prompt: string) => void;
  onClose: () => void;
}) {
  const [report, setReport] = useState<InsightReport>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<InsightCategoryId | "all">("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setReport(undefined);
    const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
    fetch(`/api/sites/${encodeURIComponent(siteId)}/insights${query}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Page audit failed");
        if (payload?.report?.site?.id !== siteId) {
          throw new Error("The insight response did not match this website.");
        }
        if (!cancelled) setReport(payload.report);
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Page audit failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, refreshKey, reload, siteId]);

  const findings = useMemo(
    () =>
      (report?.findings || []).filter(
        (finding) => filter === "all" || finding.category === filter,
      ),
    [filter, report],
  );

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col bg-[#15171c] text-white">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div>
          <strong className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-300" /> AI Insights
          </strong>
          <p className="mt-0.5 max-w-[260px] truncate text-xs text-white/40">
            {pageTitle || "Current website"}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI Insights"
          className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {loading && !report ? (
          <div className="grid h-full place-items-center p-8 text-center">
            <div>
              <Loader2 className="mx-auto animate-spin text-blue-300" />
              <p className="mt-3 text-xs text-white/40">
                Auditing the page source and experience…
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="m-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
              <button
              onClick={() => {
                setLoading(true);
                setError("");
                setReload((value) => value + 1);
              }}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        ) : report ? (
          <>
            <div className="border-b border-white/10 p-4">
              <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/15 to-violet-500/[.06] p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#60a5fa ${report.score * 3.6}deg, rgba(255,255,255,.08) 0deg)`,
                    }}
                  >
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-[#171b24]">
                      <div className="text-center">
                        <strong className="text-xl">{report.score}</strong>
                        <p className="text-[8px] uppercase text-white/35">score</p>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-blue-200">
                      Page intelligence
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      {report.stats.highPriority} high priority ·{" "}
                      {report.stats.checksPassed}/{report.stats.checksTotal} checks passed
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {report.vitals.slice(0, 3).map((metric) => (
                  <div key={metric.id} className="rounded-xl bg-white/[.04] p-2.5">
                    <span
                      className={`block h-1.5 w-1.5 rounded-full ${
                        metric.rating === "good"
                          ? "bg-emerald-400"
                          : metric.rating === "poor"
                            ? "bg-red-400"
                            : "bg-amber-400"
                      }`}
                    />
                    <strong className="mt-2 block text-xs">{metric.displayValue}</strong>
                    <p className="mt-0.5 text-[8px] uppercase tracking-wide text-white/30">
                      {metric.id}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-white/10 p-3">
              <div className="flex gap-1 overflow-x-auto">
                <Filter active={filter === "all"} onClick={() => setFilter("all")}>
                  All
                </Filter>
                {report.categories.map((category) => (
                  <Filter
                    key={category.id}
                    active={filter === category.id}
                    onClick={() => setFilter(category.id)}
                  >
                    {category.shortLabel}
                  </Filter>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">
                  Recommended changes
                </p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setReload((value) => value + 1);
                  }}
                  aria-label="Refresh page insights"
                  className="rounded-lg p-1.5 text-white/35 hover:bg-white/10 hover:text-white"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
              {findings.length ? (
                findings.map((finding) => (
                  <BuilderFinding key={finding.id} finding={finding} onFix={onFix} />
                ))
              ) : (
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[.07] p-5 text-center">
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <Check size={16} />
                  </span>
                  <p className="mt-3 text-sm font-medium">All checks passed</p>
                  <p className="mt-1 text-xs text-white/40">
                    No priority improvements in this view.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}

function BuilderFinding({
  finding,
  onFix,
}: {
  finding: InsightFinding;
  onFix: (prompt: string) => void;
}) {
  const Icon = icons[finding.category];
  return (
    <article className="rounded-xl border border-white/10 bg-white/[.035] p-3.5">
      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[finding.category]}`}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold leading-5">{finding.title}</h3>
            <span
              className={`ml-auto h-2 w-2 shrink-0 rounded-full ${
                finding.priority === "high"
                  ? "bg-red-400"
                  : finding.priority === "medium"
                    ? "bg-amber-400"
                    : "bg-blue-400"
              }`}
            />
          </div>
          <p className="mt-1 text-[11px] leading-5 text-white/40">{finding.description}</p>
          <button
            onClick={() => onFix(finding.fixPrompt)}
            className="mt-3 flex w-full items-center justify-between rounded-lg bg-blue-500/10 px-3 py-2 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/20"
          >
            <span className="flex items-center gap-1.5">
              <WandSparkles size={13} /> Fix with AI
            </span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Filter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
        active ? "bg-blue-500 text-white" : "bg-white/[.04] text-white/40"
      }`}
    >
      {children}
    </button>
  );
}
