"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, ContactRound, ExternalLink, Eye, FileText, Lightbulb, Loader2, Monitor, MousePointerClick, Plus, Users, X } from "lucide-react";

import CopilotPromptCard from "../../components/CopilotPromptCard";
import { useWorkspace } from "../../components/WorkspaceContext";

type Analytics = {
  totals: { pageViews: number; visitors: number; conversions: number; pageViewsChange: number; visitorsChange: number; bounceRate: number };
  trend: Array<{ date: string; pageViews: number }>;
  pages: Array<{ path: string; pageViews: number }>;
};

export default function SiteDashboardPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const { currentWebsite } = useWorkspace();
  const [greeting, setGreeting] = useState("Welcome back");
  const [analytics, setAnalytics] = useState<Analytics>();
  const [crm, setCrm] = useState({ total: 0, new: 0, qualified: 0 });
  const [pages, setPages] = useState({ published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsResponse, crmResponse, pagesResponse] = await Promise.all([
        fetch(`/api/analytics/${encodeURIComponent(siteSlug)}?days=30`, { cache: "no-store" }),
        currentWebsite ? fetch(`/api/crm/leads?siteId=${encodeURIComponent(currentWebsite.id)}`, { cache: "no-store" }) : null,
        fetch(`/api/pages?siteSlug=${encodeURIComponent(siteSlug)}&limit=100`, { cache: "no-store" }),
      ]);
      const analyticsPayload = analyticsResponse.ok ? await analyticsResponse.json() : null;
      const crmPayload = crmResponse?.ok ? await crmResponse.json() : null;
      const pagesPayload = pagesResponse.ok ? await pagesResponse.json() : null;
      if (analyticsPayload) setAnalytics(analyticsPayload);
      if (crmPayload) setCrm({ total: crmPayload.total || 0, new: crmPayload.counts?.NEW || 0, qualified: crmPayload.counts?.QUALIFIED || 0 });
      const pageRows = pagesPayload?.pages || pagesPayload?.data?.pages || [];
      if (Array.isArray(pageRows)) setPages({ published: pageRows.filter((page: { status: string }) => page.status === "PUBLISHED").length, drafts: pageRows.filter((page: { status: string }) => page.status !== "PUBLISHED").length });
    } finally {
      setLoading(false);
    }
  }, [currentWebsite, siteSlug]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mx-auto max-w-[1500px] pb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm dashboard-muted">Website overview · Last 30 days</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{greeting}</h1><p className="mt-1 text-sm dashboard-muted">Here’s what’s happening with <span className="font-medium text-current">{currentWebsite?.name || siteSlug}</span>.</p></div>
        <div className="flex gap-2"><Link href={`/app/${siteSlug}/pages`} className="rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover">Manage pages</Link><Link href={`/app/${siteSlug}/pages`} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"><Plus size={16} /> New page</Link></div>
      </div>

      <RecommendationBar siteSlug={siteSlug} analytics={analytics} publishedPages={pages.published} />

      <section className="mb-6 mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Eye} label="Page views" value={analytics?.totals.pageViews || 0} change={analytics?.totals.pageViewsChange} tone="cyan" loading={loading} />
        <Metric icon={Users} label="Unique visitors" value={analytics?.totals.visitors || 0} change={analytics?.totals.visitorsChange} tone="violet" loading={loading} />
        <Metric icon={MousePointerClick} label="Conversions" value={analytics?.totals.conversions || 0} changeLabel={`${crm.total} CRM leads`} tone="emerald" loading={loading} />
        <Metric icon={FileText} label="Published pages" value={pages.published} changeLabel={`${pages.drafts} drafts`} tone="amber" neutral loading={loading} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <VisitorChart data={analytics?.trend || []} total={analytics?.totals.pageViews || 0} change={analytics?.totals.pageViewsChange || 0} loading={loading} siteSlug={siteSlug} />
        <TopPages rows={analytics?.pages || []} siteSlug={siteSlug} loading={loading} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <WebsitePreview siteSlug={siteSlug} siteName={currentWebsite?.name || siteSlug} />
        <div className="grid gap-5">
          <CopilotPromptCard contextLabel={`${currentWebsite?.name || siteSlug} website`} />
          <Link href={`/app/${siteSlug}/crm`} className="dashboard-card group flex items-center gap-4 rounded-2xl p-5 dashboard-hover"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><ContactRound size={18} /></span><div><h2 className="font-semibold">CRM pipeline</h2><p className="mt-1 text-xs dashboard-muted">{crm.total} leads · {crm.new} new · {crm.qualified} qualified</p></div><ArrowUpRight className="ml-auto dashboard-faint transition group-hover:translate-x-1" size={17} /></Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, change, changeLabel, neutral, tone, loading }: { icon: typeof Eye; label: string; value: number; change?: number; changeLabel?: string; neutral?: boolean; tone: "cyan" | "violet" | "emerald" | "amber"; loading: boolean }) {
  const text = changeLabel ?? (change === undefined ? "" : `${change >= 0 ? "+" : ""}${change}%`);
  return <div className={`dashboard-card metric-card metric-${tone} rounded-2xl p-5`}><div className="flex items-center justify-between"><span className="metric-icon flex h-10 w-10 items-center justify-center rounded-xl"><Icon size={18} /></span><span className={neutral ? "text-xs dashboard-muted" : `metric-change text-xs font-semibold ${change !== undefined && change < 0 ? "!text-rose-500" : ""}`}>{text}</span></div>{loading ? <div className="mt-5 h-8 w-20 animate-pulse rounded bg-black/5 dark:bg-white/5" /> : <p className="mt-5 text-2xl font-semibold">{value.toLocaleString()}</p>}<p className="mt-1 text-xs dashboard-muted">{label}</p></div>;
}

function VisitorChart({ data, total, change, loading, siteSlug }: { data: Analytics["trend"]; total: number; change: number; loading: boolean; siteSlug: string }) {
  const max = Math.max(...data.map((item) => item.pageViews), 1);
  const visible = data.length > 14 ? data.filter((_, index) => index % Math.ceil(data.length / 14) === 0).slice(-14) : data;
  return <div className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Visitor analytics</h2><p className="mt-1 text-xs dashboard-muted">Recorded traffic across your website</p></div><Link href={`/app/${siteSlug}/analytics`} className="rounded-lg p-2 dashboard-hover" aria-label="Open analytics"><BarChart3 size={18} /></Link></div><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-semibold">{loading ? "—" : total.toLocaleString()}</span><span className={`mb-1 rounded-full px-2 py-1 text-xs font-medium ${change >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600"}`}>{change >= 0 ? "↑" : "↓"} {Math.abs(change)}%</span></div><div className="mt-7 flex h-52 items-end gap-2 border-b dashboard-border">{loading ? Array.from({ length: 14 }, (_, index) => <div key={index} className="h-full flex-1 animate-pulse rounded-t bg-black/5 dark:bg-white/5" />) : visible.map((item, index) => <div key={item.date} title={`${item.date}: ${item.pageViews} views`} className="group flex h-full flex-1 items-end"><div className={`analytics-bar analytics-bar-${index % 5} w-full rounded-t-md`} style={{ height: `${Math.max(2, (item.pageViews / max) * 100)}%`, animationDelay: `${index * 35}ms` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] dashboard-faint"><span>{data[0]?.date || "No traffic yet"}</span><span>{data[Math.floor(data.length / 2)]?.date || ""}</span><span>{data.at(-1)?.date || ""}</span></div></div>;
}

function TopPages({ rows, siteSlug, loading }: { rows: Analytics["pages"]; siteSlug: string; loading: boolean }) {
  const max = Math.max(...rows.map((row) => row.pageViews), 1);
  const tones = ["cyan", "violet", "emerald", "amber"];
  return <div className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex justify-between"><div><h2 className="font-semibold">Top pages</h2><p className="mt-1 text-xs dashboard-muted">By real page views</p></div><BarChart3 size={18} className="dashboard-muted" /></div><div className="mt-5 space-y-1">{loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin dashboard-muted" /></div> : rows.length ? rows.slice(0, 5).map((row, index) => <PageRow key={row.path} name={pageName(row.path)} path={row.path} value={row.pageViews.toLocaleString()} width={`${Math.max(5, row.pageViews / max * 100)}%`} tone={tones[index % tones.length]} />) : <p className="rounded-xl p-4 text-xs dashboard-muted dashboard-subtle">Visits will appear here as people view your published pages.</p>}</div><Link href={`/app/${siteSlug}/analytics`} className="mt-5 flex items-center justify-center gap-1 border-t dashboard-border pt-4 text-xs font-medium text-blue-600 dark:text-blue-400">View all analytics <ArrowUpRight size={13} /></Link></div>;
}

function PageRow({ name, path, value, width, tone }: { name: string; path: string; value: string; width: string; tone: string }) {
  return <div className="rounded-xl p-3 dashboard-hover"><div className="flex justify-between text-sm"><div><span className="font-medium">{name}</span><span className="ml-2 text-xs dashboard-faint">{path}</span></div><span className="dashboard-muted">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[.05] dark:bg-white/[.06]"><div className={`page-progress progress-${tone} h-full rounded-full`} style={{ width }} /></div></div>;
}

function RecommendationBar({ siteSlug, analytics, publishedPages }: { siteSlug: string; analytics?: Analytics; publishedPages: number }) {
  const recommendations = useMemo(() => {
    const items: Array<{ text: string; action: string; href: string }> = [];
    if (!publishedPages) items.push({ text: "Publish a page so visitors can discover and interact with this website.", action: "Manage pages", href: `/app/${siteSlug}/pages` });
    if (!analytics?.totals.pageViews) items.push({ text: "No visits have been recorded yet. Publish and share the website to begin collecting insights.", action: "Open website", href: `/${siteSlug}` });
    if ((analytics?.totals.bounceRate || 0) > 65) items.push({ text: `Bounce rate is ${analytics?.totals.bounceRate}%. Strengthen the opening message and primary action.`, action: "Review pages", href: `/app/${siteSlug}/pages` });
    if ((analytics?.totals.pageViews || 0) > 10 && !analytics?.totals.conversions) items.push({ text: "Traffic is arriving, but no conversions are recorded. Add a clearer form or primary call to action.", action: "Open CRM", href: `/app/${siteSlug}/crm` });
    if (items.length < 3) items.push({ text: "Review your traffic sources and top pages to decide what content to improve next.", action: "Open analytics", href: `/app/${siteSlug}/analytics` });
    if (items.length < 3) items.push({ text: "Keep your brand, SEO, social sharing, and domain information current.", action: "Site settings", href: `/app/${siteSlug}/settings` });
    return items.slice(0, 3);
  }, [analytics, publishedPages, siteSlug]);
  return <section className="ai-recommendations rounded-2xl p-3"><div className="relative flex flex-wrap items-center gap-2 px-1 pb-3 text-sm"><span className="ai-recommendations-icon flex h-8 w-8 items-center justify-center rounded-xl"><Lightbulb size={16} /></span><span className="font-semibold">AI recommendations</span><span className="dashboard-muted">Based on current website activity</span><span className="ml-auto rounded-full bg-white/50 px-2 py-1 text-[10px] font-semibold dark:bg-white/[.06]">LIVE INSIGHTS</span></div><div className="relative grid gap-2 lg:grid-cols-3">{recommendations.map((item) => <Recommendation key={`${item.action}-${item.text}`} {...item} />)}</div></section>;
}

function Recommendation({ text, action, href }: { text: string; action: string; href: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <div className="ai-recommendation-card rounded-xl p-3"><div className="flex gap-2"><p className="text-xs leading-5 dashboard-muted">{text}</p><button type="button" onClick={() => setVisible(false)} aria-label="Dismiss" className="ml-auto self-start dashboard-faint"><X size={14} /></button></div><Link href={href} className="mt-3 inline-flex rounded-lg border dashboard-border px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300">{action}</Link></div>;
}

function WebsitePreview({ siteSlug, siteName }: { siteSlug: string; siteName: string }) {
  return <div className="dashboard-card rounded-2xl p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Website preview</h2><p className="mt-1 text-xs dashboard-muted">Latest published version</p></div><Link href={`/${siteSlug}`} target="_blank" className="rounded-lg p-2 dashboard-hover" aria-label="Open website"><ExternalLink size={16} /></Link></div><div className="mt-5 overflow-hidden rounded-xl border dashboard-border bg-[var(--dashboard-bg-soft)]"><div className="flex h-8 items-center gap-1.5 border-b dashboard-border bg-[var(--dashboard-surface)] px-3"><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" /><span className="ml-2 truncate text-[9px] dashboard-faint">/{siteSlug}</span></div><div className="relative aspect-[4/3] overflow-hidden"><iframe src={`/${siteSlug}`} title={`${siteName} website preview`} className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white" /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" /><Link href={`/${siteSlug}`} target="_blank" className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-lg"><Monitor size={13} /> View website</Link></div></div></div>;
}

function pageName(path: string) {
  if (path === "/") return "Home";
  const part = path.split("/").filter(Boolean).at(-1) || "Page";
  return part.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
