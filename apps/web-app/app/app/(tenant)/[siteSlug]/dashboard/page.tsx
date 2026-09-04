"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BarChart3, Bot, CheckCircle2, CircleGauge, Coins, ContactRound, ExternalLink, Eye, FileText, Lightbulb, Loader2, Monitor, MousePointerClick, Plus, Sparkles, Users, X, Zap } from "lucide-react";

import CopilotPromptCard from "../../components/CopilotPromptCard";
import { WebsiteThumbnail } from "../../components/WebsiteThumbnail";
import { useWorkspace } from "../../components/WorkspaceContext";
import type { InsightFinding, InsightReport } from "@/modules/insights/types";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { stashPendingAttachments } from "@/modules/ai-v12/pendingAttachments";

type Analytics = {
  totals: { pageViews: number; visitors: number; conversions: number; pageViewsChange: number; visitorsChange: number; bounceRate: number };
  trend: Array<{ date: string; pageViews: number }>;
  pages: Array<{ path: string; pageViews: number }>;
};

type CreditBalance = {
  balance: {
    included: { remaining: number };
    topUp: { remaining: number };
    totalRemaining: number;
  };
  canPurchase: boolean;
};

export default function SiteDashboardPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const router = useRouter();
  const { websites, updateWebsite } = useWorkspace();
  const website = websites.find((item) => item.slug === siteSlug);
  const websiteId = website?.id;
  const [greeting, setGreeting] = useState("Welcome back");
  const [analytics, setAnalytics] = useState<Analytics>();
  const [analyticsError, setAnalyticsError] = useState("");
  const [crm, setCrm] = useState({ total: 0, new: 0, qualified: 0 });
  const [pages, setPages] = useState({ published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState<CreditBalance>();
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [siteStatus, setSiteStatus] = useState(website?.status || "DRAFT");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    setSiteStatus(website?.status || "DRAFT");
  }, [website?.status]);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setAnalyticsError("");
    try {
      const [analyticsResult, crmResult, pagesResult] = await Promise.allSettled([
        fetch(`/api/analytics/${encodeURIComponent(siteSlug)}?days=${analyticsDays}`, { cache: "no-store" }),
        websiteId ? fetch(`/api/crm/leads?siteId=${encodeURIComponent(websiteId)}`, { cache: "no-store" }) : null,
        fetch(`/api/pages?siteSlug=${encodeURIComponent(siteSlug)}&limit=100`, { cache: "no-store" }),
      ]);

      const analyticsResponse = analyticsResult.status === "fulfilled" ? analyticsResult.value : null;
      const crmResponse = crmResult.status === "fulfilled" ? crmResult.value : null;
      const pagesResponse = pagesResult.status === "fulfilled" ? pagesResult.value : null;
      const analyticsPayload = analyticsResponse ? await analyticsResponse.json().catch(() => null) : null;
      const crmPayload = crmResponse?.ok ? await crmResponse.json().catch(() => null) : null;
      const pagesPayload = pagesResponse?.ok ? await pagesResponse.json().catch(() => null) : null;

      if (analyticsResponse?.ok && analyticsPayload?.totals && Array.isArray(analyticsPayload.trend)) {
        setAnalytics(analyticsPayload);
      } else {
        setAnalytics(undefined);
        setAnalyticsError(
          analyticsPayload?.message || analyticsPayload?.error || "Analytics could not be loaded.",
        );
      }
      if (crmPayload) setCrm({ total: crmPayload.total || 0, new: crmPayload.counts?.NEW || 0, qualified: crmPayload.counts?.QUALIFIED || 0 });
      const pageRows = pagesPayload?.pages || pagesPayload?.data?.pages || [];
      if (Array.isArray(pageRows)) setPages({ published: pageRows.filter((page: { status: string }) => page.status === "PUBLISHED").length, drafts: pageRows.filter((page: { status: string }) => page.status !== "PUBLISHED").length });
    } finally {
      setLoading(false);
    }
  }, [websiteId, siteSlug, analyticsDays]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/credits", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || "AI credits unavailable");
        if (!cancelled) setCreditBalance(payload as CreditBalance);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCreditsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSiteStatus() {
    if (!websiteId || statusSaving) return;
    const nextStatus = siteStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setStatusSaving(true);
    setStatusError("");

    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(websiteId)}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Website status could not be updated.");
      }

      const savedStatus = payload?.site?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      setSiteStatus(savedStatus);
      updateWebsite(websiteId, { status: savedStatus });
    } catch (reason) {
      setStatusError(reason instanceof Error ? reason.message : "Website status could not be updated.");
    } finally {
      setStatusSaving(false);
    }
  }

  const siteIsLive = siteStatus === "PUBLISHED";

  return (
    <div className="mx-auto max-w-[1500px] pb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm dashboard-muted">Website overview · Last 30 days</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{greeting}</h1><p className="mt-1 text-sm dashboard-muted">Here’s what’s happening with <span className="font-medium text-current">{website?.name || siteSlug}</span>.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-[42px] items-center gap-2.5 px-1">
            <span className={`text-xs font-semibold ${siteIsLive ? "text-emerald-600 dark:text-emerald-300" : "dashboard-muted"}`}>
              {siteIsLive ? "Live" : "Offline"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={siteIsLive}
              aria-label={siteIsLive ? "Take website offline" : "Make website live"}
              disabled={!websiteId || statusSaving}
              onClick={() => void toggleSiteStatus()}
              className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${siteIsLive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full bg-white shadow-[0_2px_7px_rgba(0,0,0,.28)] transition-transform duration-200 ${siteIsLive ? "translate-x-5" : "translate-x-0"}`}
              >
                {statusSaving ? <Loader2 size={12} className="animate-spin text-slate-500" /> : null}
              </span>
            </button>
          </div>
          <Link
            href={publishedSitePath(siteSlug)}
            target="_blank"
            aria-disabled={!siteIsLive}
            tabIndex={siteIsLive ? undefined : -1}
            className={`inline-flex items-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover ${siteIsLive ? "" : "pointer-events-none opacity-45"}`}
          >
            <ExternalLink size={15} /> View website
          </Link>
          <Link href={`/app/${siteSlug}/pages`} className="rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover">Manage pages</Link>
          <Link href={`/app/${siteSlug}/pages`} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"><Plus size={16} /> New page</Link>
        </div>
      </div>

      {statusError ? (
        <div role="alert" className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          {statusError}
        </div>
      ) : null}

      <RecommendationBar key={websiteId || siteSlug} siteId={websiteId} siteSlug={siteSlug} analytics={analytics} publishedPages={pages.published} />

      <section className="mb-6 mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Eye} label="Page views" value={analytics?.totals.pageViews || 0} change={analytics?.totals.pageViewsChange} tone="cyan" loading={loading} />
        <Metric icon={Users} label="Unique visitors" value={analytics?.totals.visitors || 0} change={analytics?.totals.visitorsChange} tone="violet" loading={loading} />
        <Metric icon={MousePointerClick} label="Conversions" value={analytics?.totals.conversions || 0} changeLabel={`${crm.total} CRM leads`} tone="emerald" loading={loading} />
        <Metric icon={FileText} label="Published pages" value={pages.published} changeLabel={`${pages.drafts} drafts`} tone="amber" neutral loading={loading} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <VisitorChart data={analytics?.trend || []} total={analytics?.totals.pageViews || 0} change={analytics?.totals.pageViewsChange || 0} loading={loading} error={analyticsError} onRetry={()=>void load()} siteSlug={siteSlug} days={analyticsDays} onDaysChange={setAnalyticsDays} />
        <TopPages rows={analytics?.pages || []} siteSlug={siteSlug} loading={loading} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <WebsitePreview siteId={websiteId} siteSlug={siteSlug} siteName={website?.name || siteSlug} siteStatus={website?.status} />
        <AiCreditsCard balance={creditBalance} loading={creditsLoading} />
        <div className="xl:col-start-2 xl:row-start-1 [&>*]:h-full">
          <CopilotPromptCard contextLabel={`${website?.name || siteSlug} website`} onSubmit={(prompt,attachments)=>{if(!websiteId)return;stashPendingAttachments(attachments ?? []);const query=new URLSearchParams({panel:'ai',context:'Website',prompt:prompt.slice(0,4000)});router.push(`/app/builder-v3/${websiteId}?${query.toString()}`)}} />
        </div>
        <Link href={`/app/${siteSlug}/crm`} className="dashboard-card group flex items-center gap-4 rounded-2xl p-5 dashboard-hover xl:col-start-2 xl:row-start-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><ContactRound size={18} /></span><div><h2 className="font-semibold">CRM pipeline</h2><p className="mt-1 text-xs dashboard-muted">{crm.total} leads · {crm.new} new · {crm.qualified} qualified</p></div><ArrowUpRight className="ml-auto dashboard-faint transition group-hover:translate-x-1" size={17} /></Link>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, change, changeLabel, neutral, tone, loading }: { icon: typeof Eye; label: string; value: number; change?: number; changeLabel?: string; neutral?: boolean; tone: "cyan" | "violet" | "emerald" | "amber"; loading: boolean }) {
  const text = changeLabel ?? (change === undefined ? "" : `${change >= 0 ? "+" : ""}${change}%`);
  return <div className={`dashboard-card metric-card metric-${tone} rounded-2xl p-5`}><div className="flex items-center justify-between"><span className="metric-icon flex h-10 w-10 items-center justify-center rounded-xl"><Icon size={18} /></span><span className={neutral ? "text-xs dashboard-muted" : `metric-change text-xs font-semibold ${change !== undefined && change < 0 ? "!text-rose-500" : ""}`}>{text}</span></div>{loading ? <div className="mt-5 h-8 w-20 animate-pulse rounded bg-black/5 dark:bg-white/5" /> : <p className="mt-5 text-2xl font-semibold">{value.toLocaleString()}</p>}<p className="mt-1 text-xs dashboard-muted">{label}</p></div>;
}

const VISITOR_RANGES: Array<{ label: string; days: number }> = [
  { label: "24H", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
];

function VisitorChart({ data, total, change, loading, error, onRetry, siteSlug, days, onDaysChange }: { data: Analytics["trend"]; total: number; change: number; loading: boolean; error: string; onRetry: () => void; siteSlug: string; days: number; onDaysChange: (days: number) => void }) {
  const max = Math.max(...data.map((item) => item.pageViews), 1);
  const visible = data.length > 14 ? data.filter((_, index) => index % Math.ceil(data.length / 14) === 0).slice(-14) : data;
  return <div className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Visitor analytics</h2><p className="mt-1 text-xs dashboard-muted">Recorded traffic across your website</p></div><div className="flex items-center gap-2"><div className="flex items-center gap-1 rounded-lg dashboard-subtle p-1">{VISITOR_RANGES.map((range) => <button key={range.label} type="button" onClick={() => onDaysChange(range.days)} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${days === range.days ? "bg-blue-600 text-white" : "dashboard-muted hover:text-[var(--dashboard-text)]"}`}>{range.label}</button>)}</div><Link href={`/app/${siteSlug}/analytics`} className="rounded-lg p-2 dashboard-hover" aria-label="Open analytics"><BarChart3 size={18} /></Link></div></div><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-semibold">{loading ? "—" : total.toLocaleString()}</span>{!error ? <span className={`mb-1 rounded-full px-2 py-1 text-xs font-medium ${change >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600"}`}>{change >= 0 ? "↑" : "↓"} {Math.abs(change)}%</span> : null}</div><div className="mt-7 flex h-52 items-end gap-2 border-b dashboard-border">{loading ? Array.from({ length: 14 }, (_, index) => <div key={index} className="h-full flex-1 animate-pulse rounded-t bg-black/5 dark:bg-white/5" />) : error ? <div role="alert" className="m-auto max-w-sm text-center"><p className="text-sm font-medium">Analytics didn’t load</p><p className="mt-1 text-xs dashboard-muted">{error}</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg border dashboard-border px-3 py-2 text-xs dashboard-hover">Try again</button></div> : visible.map((item, index) => <div key={item.date} title={`${item.date}: ${item.pageViews} views`} className="group flex h-full min-w-0 flex-1 items-end"><div className={`analytics-bar analytics-bar-${index % 5} w-full rounded-t-md`} style={{ height: `${Math.max(2, (item.pageViews / max) * 100)}%`, animationDelay: `${index * 35}ms` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] dashboard-faint"><span>{data[0]?.date || (error ? "" : "No traffic yet")}</span><span>{data[Math.floor(data.length / 2)]?.date || ""}</span><span>{data.at(-1)?.date || ""}</span></div></div>;
}

function TopPages({ rows, siteSlug, loading }: { rows: Analytics["pages"]; siteSlug: string; loading: boolean }) {
  const max = Math.max(...rows.map((row) => row.pageViews), 1);
  const tones = ["cyan", "violet", "emerald", "amber"];
  return <div className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex justify-between"><div><h2 className="font-semibold">Top pages</h2><p className="mt-1 text-xs dashboard-muted">By real page views</p></div><BarChart3 size={18} className="dashboard-muted" /></div><div className="mt-5 space-y-1">{loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin dashboard-muted" /></div> : rows.length ? rows.slice(0, 5).map((row, index) => <PageRow key={row.path} name={pageName(row.path)} path={row.path} value={row.pageViews.toLocaleString()} width={`${Math.max(5, row.pageViews / max * 100)}%`} tone={tones[index % tones.length]} />) : <p className="rounded-xl p-4 text-xs dashboard-muted dashboard-subtle">Visits will appear here as people view your published pages.</p>}</div><Link href={`/app/${siteSlug}/analytics`} className="mt-5 flex items-center justify-center gap-1 border-t dashboard-border pt-4 text-xs font-medium text-blue-600 dark:text-blue-400">View all analytics <ArrowUpRight size={13} /></Link></div>;
}

function PageRow({ name, path, value, width, tone }: { name: string; path: string; value: string; width: string; tone: string }) {
  return <div className="rounded-xl p-3 dashboard-hover"><div className="flex justify-between text-sm"><div><span className="font-medium">{name}</span><span className="ml-2 text-xs dashboard-faint">{path}</span></div><span className="dashboard-muted">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[.05] dark:bg-white/[.06]"><div className={`page-progress progress-${tone} h-full rounded-full`} style={{ width }} /></div></div>;
}

function RecommendationBar({ siteId, siteSlug, analytics, publishedPages }: { siteId?: string; siteSlug: string; analytics?: Analytics; publishedPages: number }) {
  const [report, setReport] = useState<InsightReport>();
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [shopStatus, setShopStatus] = useState<{ enabled: boolean; hasPaymentGateway: boolean }>();

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    fetch(`/api/sites/${encodeURIComponent(siteId)}/insights`, { cache: "no-store" })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error("Insights unavailable");
        if (!cancelled) setReport(payload.report);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setInsightsLoading(false); });
    return () => { cancelled = true; };
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    fetch(`/api/shopez/status?siteId=${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : null)
      .then(payload => { if (!cancelled && payload) setShopStatus(payload); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [siteId]);

  const recommendations = useMemo(() => {
    const items: Array<{ text: string; action: string; href: string; insight?: boolean }> = [];
    if (siteId && report?.quickWins.length) {
      items.push(...report.quickWins.slice(0, 2).map(finding => ({
        text: finding.description,
        action: finding.actionLabel,
        href: insightFixHref(siteId, finding),
        insight: true,
      })));
    }
    if (shopStatus?.enabled && !shopStatus.hasPaymentGateway) items.push({ text: "Shopez is live but no payment gateway is connected yet, so customers can't pay.", action: "Set up payments", href: `/app/${siteSlug}/shopez?view=payments` });
    if (!publishedPages) items.push({ text: "Publish a page so visitors can discover and interact with this website.", action: "Manage pages", href: `/app/${siteSlug}/pages` });
    if (!analytics?.totals.pageViews) items.push({ text: "No visits have been recorded yet. Publish and share the website to begin collecting insights.", action: "Open website", href: siteId ? publishedSitePath(siteSlug) : `/app/${siteSlug}/pages` });
    if ((analytics?.totals.bounceRate || 0) > 65) items.push({ text: `Bounce rate is ${analytics?.totals.bounceRate}%. Strengthen the opening message and primary action.`, action: "Review pages", href: `/app/${siteSlug}/pages` });
    if ((analytics?.totals.pageViews || 0) > 10 && !analytics?.totals.conversions) items.push({ text: "Traffic is arriving, but no conversions are recorded. Add a clearer form or primary call to action.", action: "Open CRM", href: `/app/${siteSlug}/crm` });
    if (items.length < 3) items.push({ text: "Review your traffic sources and top pages to decide what content to improve next.", action: "Open analytics", href: `/app/${siteSlug}/analytics` });
    if (items.length < 3) items.push({ text: "Keep your brand, SEO, social sharing, and domain information current.", action: "Site settings", href: `/app/${siteSlug}/settings` });
    return items.slice(0, 3);
  }, [analytics, publishedPages, report, shopStatus, siteId, siteSlug]);

  return <section className="ai-recommendations relative overflow-hidden rounded-2xl p-3">
    <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
    <div className="relative flex flex-wrap items-center gap-2 px-1 pb-3 text-sm">
      <span className="ai-recommendations-icon flex h-8 w-8 items-center justify-center rounded-xl"><Lightbulb size={16} /></span>
      <span className="font-semibold">AI recommendations</span>
      <span className="dashboard-muted">Website activity, SEO, GEO, speed and conversion</span>
      <span className="ml-auto rounded-full bg-white/50 px-2 py-1 text-[10px] font-semibold dark:bg-white/[.06]">SAVED · AUTO-UPDATES</span>
    </div>

    <div className="relative mb-2 grid gap-3 rounded-xl border dashboard-border bg-white/35 p-4 backdrop-blur-sm dark:bg-black/10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Sparkles size={18} /></span>
        {siteId && insightsLoading ? <div className="flex items-center gap-2 text-xs dashboard-muted"><Loader2 size={14} className="animate-spin" />Auditing website…</div> : report ? <div><div className="flex items-center gap-2"><CircleGauge size={16} className="text-blue-500"/><strong className="text-2xl">{report.score}</strong><span className="text-[9px] font-semibold uppercase tracking-wider dashboard-faint">Health score</span></div></div> : <div><p className="text-sm font-semibold">Website intelligence</p><p className="text-[10px] dashboard-faint">Ready for your first audit</p></div>}
      </div>

      {report ? <div className="min-w-0 border-y dashboard-border py-3 lg:border-x lg:border-y-0 lg:px-4 lg:py-0">
        <p className="text-xs leading-5 dashboard-muted">{report.summary}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-500"/>{report.stats.highPriority} high priority</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500"/>{report.stats.checksPassed}/{report.stats.checksTotal} checks passed</span>
          <span className="flex items-center gap-1.5"><Bot size={12} className="text-violet-500"/>10 specialist agents</span>
        </div>
      </div> : <p className="text-xs dashboard-muted">Insights will combine site quality with real visitor activity in one prioritized view.</p>}

      <Link href={`/app/${siteSlug}/insights`} className="flex items-center justify-center gap-1.5 rounded-lg border dashboard-border bg-white/70 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-white dark:bg-white/[.06] dark:text-blue-300 dark:hover:bg-white/10">View insights <ArrowRight size={13}/></Link>
    </div>

    <div className="relative grid gap-2 lg:grid-cols-3">{recommendations.map((item) => <Recommendation key={`${item.action}-${item.text}`} {...item} />)}</div>
  </section>;
}

function insightFixHref(siteId: string, finding: InsightFinding) {
  const query = new URLSearchParams({ panel: "ai", context: "Page", prompt: finding.fixPrompt });
  if (finding.pageId) query.set("pageId", finding.pageId);
  return `/app/builder-v3/${siteId}?${query.toString()}`;
}

function Recommendation({ text, action, href, insight }: { text: string; action: string; href: string; insight?: boolean }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <div className="ai-recommendation-card rounded-xl p-3"><div className="flex gap-2">{insight ? <Sparkles size={13} className="mt-1 shrink-0 text-violet-500"/> : null}<p className="text-xs leading-5 dashboard-muted">{text}</p><button type="button" onClick={() => setVisible(false)} aria-label="Dismiss" className="ml-auto self-start dashboard-faint"><X size={14} /></button></div><Link href={href} className="mt-3 inline-flex items-center gap-1 rounded-lg border dashboard-border px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300">{action}{insight ? <ArrowRight size={12}/> : null}</Link></div>;
}

function WebsitePreview({ siteId, siteSlug, siteName, siteStatus }: { siteId?: string; siteSlug: string; siteName: string; siteStatus?: string }) {
  const previewUrl = siteId && siteStatus === "PUBLISHED" ? publishedSitePath(siteSlug) : "";
  return <div className="dashboard-card h-full rounded-2xl p-5 xl:col-start-1 xl:row-start-1"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Website preview</h2><p className="mt-1 text-xs dashboard-muted">Latest website version</p></div>{previewUrl ? <Link href={previewUrl} target="_blank" className="rounded-lg p-2 dashboard-hover" aria-label="Open website"><ExternalLink size={16} /></Link> : null}</div><div className="mt-5 overflow-hidden rounded-xl border dashboard-border bg-[var(--dashboard-bg-soft)]"><div className="flex h-8 items-center gap-1.5 border-b dashboard-border bg-[var(--dashboard-surface)] px-3"><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="ml-2 truncate text-[9px] dashboard-faint">/{siteSlug}</span></div><div className="relative aspect-[4/3] max-h-[320px] overflow-hidden">{siteId ? <><WebsiteThumbnail siteId={siteId} siteName={siteName} siteStatus={siteStatus} className="h-full w-full" />{previewUrl ? <Link href={previewUrl} target="_blank" className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-lg"><Monitor size={13} /> View website</Link> : null}</> : <img src="/website-placeholder.svg" alt={`${siteName} website preview placeholder`} className="h-full w-full object-cover" />}</div></div></div>;
}

function AiCreditsCard({ balance, loading }: { balance?: CreditBalance; loading: boolean }) {
  const total = balance?.balance.totalRemaining ?? 0;
  const included = balance?.balance.included.remaining ?? 0;
  const topUp = balance?.balance.topUp.remaining ?? 0;

  return (
    <article className="dashboard-card flex items-center gap-4 rounded-2xl p-5 xl:col-start-1 xl:row-start-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
        <Coins size={19} />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold">AI credits</h2>
        {loading ? (
          <div className="mt-2 h-5 w-28 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        ) : (
          <p className="mt-1 text-xs dashboard-muted">
            <strong className="text-lg font-semibold tabular-nums text-[var(--dashboard-text)]">{total.toLocaleString()}</strong>{" "}
            available · {included.toLocaleString()} included · {topUp.toLocaleString()} top-up
          </p>
        )}
      </div>
      <Link
        href="/app/workspace/billing#ai-credits"
        className="dashboard-primary-button ml-auto shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
      >
        Add credits
      </Link>
    </article>
  );
}

function pageName(path: string) {
  if (path === "/") return "Home";
  const part = path.split("/").filter(Boolean).at(-1) || "Page";
  return part.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
