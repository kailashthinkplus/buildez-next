"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleGauge,
  Gauge,
  Globe2,
  Lightbulb,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  InsightCategoryId,
  InsightFinding,
  InsightReport,
} from "@/modules/insights/types";
import { useWorkspace } from "../../components/WorkspaceContext";

type ViewId = "overview" | InsightCategoryId | "pagespeed";

const categoryUI: Record<
  InsightCategoryId,
  { icon: LucideIcon; tone: string; ring: string }
> = {
  seo: { icon: Search, tone: "text-blue-500 bg-blue-500/10", ring: "#3b82f6" },
  geo: { icon: Globe2, tone: "text-violet-500 bg-violet-500/10", ring: "#8b5cf6" },
  performance: { icon: Zap, tone: "text-amber-500 bg-amber-500/10", ring: "#f59e0b" },
  accessibility: { icon: Accessibility, tone: "text-cyan-500 bg-cyan-500/10", ring: "#06b6d4" },
  conversion: { icon: MousePointerClick, tone: "text-emerald-500 bg-emerald-500/10", ring: "#10b981" },
  "best-practices": { icon: ShieldCheck, tone: "text-rose-500 bg-rose-500/10", ring: "#f43f5e" },
};

function builderHref(siteId: string, finding: InsightFinding) {
  const query = new URLSearchParams({
    panel: "ai",
    context: "Page",
    prompt: finding.fixPrompt,
  });
  if (finding.pageId) query.set("pageId", finding.pageId);
  return `/app/builder-v3/${siteId}?${query.toString()}`;
}

export default function InsightCenterPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const { websites, loading: workspaceLoading } = useWorkspace();
  const website = websites.find((item) => item.slug === siteSlug);
  const [report, setReport] = useState<InsightReport>();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewId>("overview");
  const [error, setError] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [liveRunning, setLiveRunning] = useState(false);

  const load = useCallback(async () => {
    if (!website?.id) {
      setReport(undefined);
      setLoading(workspaceLoading);
      setError(workspaceLoading ? "" : "This website does not belong to the current workspace.");
      return;
    }
    setLoading(true);
    setError("");
    setReport(undefined);
    try {
      const response = await fetch(
        `/api/sites/${encodeURIComponent(website.id)}/insights`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Insights could not be loaded");
      if (payload?.report?.site?.id !== website.id) {
        throw new Error("The insight response did not match this website.");
      }
      setReport(payload.report);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Insights could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [website?.id, workspaceLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleFindings = useMemo(() => {
    if (!report) return [];
    if (view === "overview" || view === "pagespeed") return report.findings;
    return report.findings.filter((finding) => finding.category === view);
  }, [report, view]);

  async function runLiveTest() {
    if (!website?.id || !liveUrl.trim() || liveRunning) return;
    setLiveRunning(true);
    setError("");
    try {
      const response = await fetch(
        `/api/sites/${encodeURIComponent(website.id)}/insights`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: liveUrl.trim(), strategy }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Live test could not finish");
      if (payload?.report?.site?.id !== website.id) throw new Error("The PageSpeed response did not match this website.");
      setReport(payload.report);
      setView("pagespeed");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Live test could not finish");
    } finally {
      setLiveRunning(false);
    }
  }

  if (loading && !report) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-500" />
          <p className="mt-3 text-sm dashboard-muted">Auditing your website intelligence…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] pb-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300">
            <Sparkles size={15} /> AI Insight Center
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.045em]">
            Make every page easier to find, faster and more effective.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 dashboard-muted">
            One prioritized audit across SEO, AI discovery, Core Web Vitals,
            accessibility, conversion and production quality for {report?.site.name || siteSlug}.
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh audit
        </button>
      </header>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {report && (
        <>
          <section className="mt-7 grid gap-5 xl:grid-cols-[360px_1fr]">
            <ScoreHero report={report} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {report.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setView(category.id)}
                  className="dashboard-card group rounded-2xl p-5 text-left dashboard-hover"
                >
                  <div className="flex items-center justify-between">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${categoryUI[category.id].tone}`}>
                      {(() => {
                        const Icon = categoryUI[category.id].icon;
                        return <Icon size={18} />;
                      })()}
                    </span>
                    <ScorePill score={category.score} />
                  </div>
                  <h2 className="mt-5 text-sm font-semibold">{category.label}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 dashboard-muted">
                    {category.summary}
                  </p>
                  <div className="mt-4 flex items-center text-[11px] dashboard-faint">
                    {category.checksPassed}/{category.checksTotal} checks passed
                    <ChevronRight size={14} className="ml-auto transition group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <nav className="mt-7 flex gap-1 overflow-x-auto rounded-xl border dashboard-border p-1">
            <Tab active={view === "overview"} onClick={() => setView("overview")}>
              Overview
            </Tab>
            {report.categories.map((category) => (
              <Tab
                key={category.id}
                active={view === category.id}
                onClick={() => setView(category.id)}
              >
                {category.shortLabel}
              </Tab>
            ))}
            <Tab active={view === "pagespeed"} onClick={() => setView("pagespeed")}>
              PageSpeed
            </Tab>
          </nav>

          {view === "overview" && (
            <Overview
              report={report}
              siteId={website?.id || ""}
              onOpenCategory={setView}
            />
          )}
          {view === "pagespeed" && (
            <PageSpeedView
              report={report}
              url={liveUrl}
              setUrl={setLiveUrl}
              strategy={strategy}
              setStrategy={setStrategy}
              running={liveRunning}
              onRun={runLiveTest}
              siteId={website?.id || ""}
            />
          )}
          {view !== "overview" && view !== "pagespeed" && (
            <CategoryView
              report={report}
              categoryId={view}
              findings={visibleFindings}
              siteId={website?.id || ""}
            />
          )}
        </>
      )}
    </div>
  );
}

function ScoreHero({ report }: { report: InsightReport }) {
  const color =
    report.score >= 90 ? "#10b981" : report.score >= 70 ? "#3b82f6" : "#f59e0b";
  return (
    <article className="relative overflow-hidden rounded-[26px] border border-blue-300/20 bg-gradient-to-br from-[#0b1630] via-[#111b35] to-[#16102d] p-6 text-white shadow-xl shadow-blue-950/10">
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative flex items-center gap-5">
        <div
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${report.score * 3.6}deg, rgba(255,255,255,.09) 0deg)`,
          }}
        >
          <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-[#11182c]">
            <div className="text-center">
              <strong className="text-3xl">{report.score}</strong>
              <p className="text-[9px] uppercase tracking-wider text-white/45">health</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-blue-300">
            Website score
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {report.score >= 90 ? "Excellent" : report.score >= 75 ? "Healthy" : report.score >= 55 ? "Needs work" : "At risk"}
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/55">{report.summary}</p>
        </div>
      </div>
      <div className="relative mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
        <HeroStat value={report.stats.highPriority} label="high priority" />
        <HeroStat value={report.stats.opportunities} label="opportunities" />
        <HeroStat value={report.stats.pagesAudited} label="pages audited" />
      </div>
    </article>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <strong className="text-lg">{value}</strong>
      <p className="mt-0.5 text-[10px] text-white/40">{label}</p>
    </div>
  );
}

function Overview({
  report,
  siteId,
  onOpenCategory,
}: {
  report: InsightReport;
  siteId: string;
  onOpenCategory: (view: ViewId) => void;
}) {
  return (
    <>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <article className="dashboard-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <Lightbulb size={17} className="text-amber-500" /> Highest-impact actions
            </h2>
            <p className="mt-1 text-xs dashboard-muted">
              Prioritized across every page and specialist.
            </p>
          </div>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-500">
            AI prioritized
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {report.quickWins.length ? (
            report.quickWins.map((finding) => (
              <FindingRow key={finding.id} finding={finding} siteId={siteId} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
        </article>

        <div className="space-y-5">
          <article className="dashboard-card rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <CircleGauge size={17} className="text-blue-500" />
            <h2 className="font-semibold">Core Web Vitals</h2>
          </div>
          <p className="mt-1 text-xs dashboard-muted">
            Modeled from page structure until a live URL is tested.
          </p>
          <div className="mt-5 space-y-4">
            {report.vitals.slice(0, 3).map((metric) => (
              <VitalMini key={metric.id} metric={metric} />
            ))}
          </div>
          <button
            onClick={() => onOpenCategory("pagespeed")}
            className="mt-5 flex w-full items-center justify-center gap-1 border-t dashboard-border pt-4 text-xs font-semibold text-blue-600 dark:text-blue-300"
          >
            Open PageSpeed lab <ArrowRight size={13} />
          </button>
          </article>

          <article className="dashboard-card rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Bot size={17} className="text-violet-500" />
            <h2 className="font-semibold">Specialist agents</h2>
          </div>
          <p className="mt-2 text-xs leading-5 dashboard-muted">
            Six agents continuously share this audit and hand approved fixes to the visual builder.
          </p>
          <Link
            href={`/app/${report.site.slug}/ai`}
            className="mt-4 flex items-center justify-between rounded-xl bg-violet-500/10 p-3 text-sm font-semibold text-violet-600 dark:text-violet-300"
          >
            Open AI Agents <ChevronRight size={15} />
          </Link>
          </article>
        </div>
      </section>

      <article className="dashboard-card mt-5 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Page health</h2>
            <p className="mt-1 text-xs dashboard-muted">
              Open page-level insights directly inside the visual builder.
            </p>
          </div>
          <span className="rounded-full bg-black/[.035] px-2.5 py-1 text-[10px] dashboard-muted dark:bg-white/[.05]">
            {report.pages.length} page{report.pages.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[.12em] dashboard-faint">
              <tr className="border-b dashboard-border">
                <th className="pb-3 font-semibold">Page</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Health</th>
                <th className="pb-3 font-semibold">Opportunities</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {report.pages.map((page) => (
                <tr key={page.id} className="border-b dashboard-border last:border-0">
                  <td className="py-4">
                    <p className="font-medium">{page.title}</p>
                    <p className="mt-0.5 text-[10px] dashboard-faint">/{page.slug}</p>
                  </td>
                  <td className="py-4">
                    <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${page.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-slate-500/10 dashboard-muted"}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="py-4"><ScorePill score={page.score} /></td>
                  <td className="py-4 text-xs dashboard-muted">{page.issueCount}</td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/app/builder-v3/${siteId}?pageId=${encodeURIComponent(page.id)}&panel=insights`}
                      className="inline-flex items-center gap-1 rounded-lg border dashboard-border px-3 py-2 text-xs font-semibold dashboard-hover"
                    >
                      Open in builder <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!report.pages.length && (
            <p className="py-8 text-center text-xs dashboard-muted">
              Create a page to begin page-level auditing.
            </p>
          )}
        </div>
      </article>
    </>
  );
}

function CategoryView({
  report,
  categoryId,
  findings,
  siteId,
}: {
  report: InsightReport;
  categoryId: InsightCategoryId;
  findings: InsightFinding[];
  siteId: string;
}) {
  const category = report.categories.find((item) => item.id === categoryId)!;
  const Icon = categoryUI[categoryId].icon;
  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="dashboard-card h-fit rounded-2xl p-6">
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${categoryUI[categoryId].tone}`}>
          <Icon size={21} />
        </span>
        <h2 className="mt-5 text-xl font-semibold">{category.label}</h2>
        <p className="mt-2 text-sm leading-6 dashboard-muted">{category.summary}</p>
        <div className="mt-6 flex items-end justify-between border-t dashboard-border pt-5">
          <div>
            <strong className="text-3xl">{category.score}</strong>
            <span className="text-sm dashboard-faint"> / 100</span>
          </div>
          <ScorePill score={category.score} />
        </div>
        <p className="mt-4 text-xs dashboard-muted">
          {category.checksPassed} of {category.checksTotal} checks passed
        </p>
      </aside>
      <article className="dashboard-card rounded-2xl p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Recommended improvements</h2>
          <p className="mt-1 text-xs dashboard-muted">
            Review each change, then hand it to the builder AI.
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {findings.length ? (
            findings.map((finding) => (
              <FindingRow key={finding.id} finding={finding} siteId={siteId} expanded />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </article>
    </section>
  );
}

function PageSpeedView({
  report,
  url,
  setUrl,
  strategy,
  setStrategy,
  running,
  onRun,
  siteId,
}: {
  report: InsightReport;
  url: string;
  setUrl: (value: string) => void;
  strategy: "mobile" | "desktop";
  setStrategy: (value: "mobile" | "desktop") => void;
  running: boolean;
  onRun: () => void;
  siteId: string;
}) {
  return (
    <section className="mt-5">
      <article className="relative overflow-hidden rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white sm:p-6">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Gauge size={18} /> Google PageSpeed Insights
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/75">
              Test a public page to replace modeled speed values with Lighthouse and available real-user Chrome UX data.
            </p>
            <div className="mt-4 flex max-w-3xl flex-col gap-2 sm:flex-row">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://your-public-page.com"
                aria-label="Public URL for PageSpeed test"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200/60"
              />
              <div className="flex rounded-xl border border-white/15 bg-black/15 p-1">
                {(["mobile", "desktop"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setStrategy(value)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${strategy === value ? "bg-white text-blue-700" : "text-white/65"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onRun}
            disabled={!url.trim() || running}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-blue-700 shadow-lg disabled:opacity-45"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {running ? "Testing…" : "Run live test"}
          </button>
        </div>
      </article>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {report.vitals.map((metric) => (
          <article key={metric.id} className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <RatingDot rating={metric.rating} />
              <span className="rounded-full bg-black/[.035] px-2 py-1 text-[9px] uppercase tracking-wider dashboard-faint dark:bg-white/[.05]">
                {metric.source === "pagespeed" ? "Live test" : "Modeled"}
              </span>
            </div>
            <strong className="mt-5 block text-2xl">{metric.displayValue}</strong>
            <h3 className="mt-1 text-sm font-semibold">{metric.label}</h3>
            <p className="mt-2 text-xs leading-5 dashboard-muted">{metric.description}</p>
          </article>
        ))}
      </div>

      <article className="dashboard-card mt-5 rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold">Performance opportunities</h2>
        <p className="mt-1 text-xs dashboard-muted">
          Source-aware improvements that the builder AI can apply safely.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {report.findings
            .filter((finding) => finding.category === "performance")
            .map((finding) => (
              <FindingRow key={finding.id} finding={finding} siteId={siteId} />
            ))}
        </div>
      </article>
    </section>
  );
}

function FindingRow({
  finding,
  siteId,
  expanded,
}: {
  finding: InsightFinding;
  siteId: string;
  expanded?: boolean;
}) {
  const Icon = categoryUI[finding.category].icon;
  return (
    <div className="rounded-xl border dashboard-border p-4">
      <div className="flex gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${categoryUI[finding.category].tone}`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{finding.title}</h3>
            <Priority priority={finding.priority} />
            {finding.pageTitle && (
              <span className="text-[10px] dashboard-faint">{finding.pageTitle}</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 dashboard-muted">{finding.description}</p>
          {expanded && (
            <p className="mt-2 text-xs leading-5">
              <span className="font-semibold">Why it matters:</span>{" "}
              <span className="dashboard-muted">{finding.impact}</span>
            </p>
          )}
        </div>
        <Link
          href={builderHref(siteId, finding)}
          className="self-center whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          Fix with AI
        </Link>
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const style =
    score >= 90
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
      : score >= 70
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{score}</span>;
}

function Priority({ priority }: { priority: InsightFinding["priority"] }) {
  const style =
    priority === "high"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
      : priority === "medium"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
        : "bg-slate-500/10 dashboard-muted";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style}`}>
      {priority}
    </span>
  );
}

function RatingDot({ rating }: { rating: "good" | "needs-improvement" | "poor" }) {
  const style =
    rating === "good"
      ? "bg-emerald-500 shadow-emerald-500/40"
      : rating === "poor"
        ? "bg-rose-500 shadow-rose-500/40"
        : "bg-amber-500 shadow-amber-500/40";
  return <span className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px] ${style}`} />;
}

function VitalMini({ metric }: { metric: InsightReport["vitals"][number] }) {
  return (
    <div className="flex items-center gap-3">
      <RatingDot rating={metric.rating} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{metric.label}</p>
        <p className="text-[10px] dashboard-faint">{metric.source === "pagespeed" ? "Live PageSpeed" : "Modeled"}</p>
      </div>
      <strong className="ml-auto text-sm">{metric.displayValue}</strong>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-emerald-500/10 p-6 text-center">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
        <Check size={18} />
      </span>
      <h3 className="mt-3 text-sm font-semibold">All checks passed</h3>
      <p className="mt-1 text-xs dashboard-muted">No priority improvements were found in this view.</p>
    </div>
  );
}

function Tab({
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
      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
        active ? "bg-blue-600 text-white shadow-sm" : "dashboard-muted dashboard-hover"
      }`}
    >
      {children}
    </button>
  );
}
