"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Crown,
  LayoutGrid,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";
import { MARKETPLACE_APPS, MARKETPLACE_CATEGORIES, type AppPlan, type MarketplaceApp, type PublicConfigField } from "@/modules/integrations/catalog";

type AppState = Omit<MarketplaceApp, "configFields"> & {
  configFields?: PublicConfigField[];
  installed: boolean;
  config: Record<string, string> | null;
};

function logoUrl(slug: string) {
  return `https://cdn.simpleicons.org/${slug}`;
}

export default function AppsMarketplaceClient({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [plan, setPlan] = useState<"All" | AppPlan>("All");
  const [apps, setApps] = useState<AppState[]>(MARKETPLACE_APPS.map((app) => ({ ...app, installed: false, config: null })));
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sites/${siteId}/integrations`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.apps) return;
        setApps(payload.apps);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [siteId]);

  const visibleApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apps.filter((app) =>
      (category === "All" || app.category === category) &&
      (plan === "All" || app.plan === plan) &&
      (!needle || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(needle))
    );
  }, [apps, query, category, plan]);

  const selected = apps.find((app) => app.slug === selectedSlug) || null;
  const installedCount = apps.filter((app) => app.installed).length;

  function openApp(app: AppState) {
    setSelectedSlug(app.slug);
    setFields(app.config || {});
    setError("");
  }

  async function connect() {
    if (!selected) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/sites/${siteId}/integrations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appSlug: selected.slug, config: fields }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) { setError(body.error || "Could not connect this app"); return; }
    setApps((current) => current.map((app) => app.slug === selected.slug ? { ...app, installed: true, config: body.config } : app));
    setSelectedSlug(null);
  }

  async function disconnect() {
    if (!selected) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/sites/${siteId}/integrations?appSlug=${encodeURIComponent(selected.slug)}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) { setError("Could not disconnect this app"); return; }
    setApps((current) => current.map((app) => app.slug === selected.slug ? { ...app, installed: false, config: null } : app));
    setSelectedSlug(null);
  }

  return (
    <div className="relative px-1 py-2 md:px-2">
      <div className="pointer-events-none absolute left-[10%] top-0 h-80 w-80 rounded-full bg-[#1349A3]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[8%] top-40 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1400px] space-y-6">
        <section className="overflow-hidden rounded-[26px] border dashboard-border dashboard-card-strong">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1349A3]/10 px-3 py-1.5 text-xs font-semibold text-[#1349A3] dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" /> BuildEZ Apps Marketplace
              </div>
              <h1 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">Make {siteName} work with the tools you already love.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 dashboard-muted">Connect marketing, payments, analytics, bookings, automation and more. Analytics apps connect instantly — everything else is on its way.</p>
            </div>
            <div className="flex gap-6 rounded-2xl dashboard-subtle px-5 py-4 text-sm">
              <div><div className="text-xl font-semibold">{apps.length}</div><div className="dashboard-muted">Apps</div></div>
              <div><div className="text-xl font-semibold">{apps.filter((app) => app.functional).length}</div><div className="dashboard-muted">Available</div></div>
              <div><div className="text-xl font-semibold">{installedCount}</div><div className="dashboard-muted">Connected</div></div>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-10 flex flex-col gap-3 rounded-2xl border dashboard-border dashboard-card-strong p-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="dashboard-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps and integrations" className="w-full rounded-xl border dashboard-border bg-transparent py-2.5 pl-10 pr-10 text-sm outline-none focus:border-[#3B82F6]" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search" className="dashboard-muted absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></button>}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[55%] lg:pb-0">
            {MARKETPLACE_CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition ${category === item ? "bg-[#1349A3] text-white" : "dashboard-subtle dashboard-hover"}`}>{item}</button>)}
          </div>
          <select value={plan} onChange={(event) => setPlan(event.target.value as "All" | AppPlan)} aria-label="Filter by plan" className="rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-xs font-medium outline-none">
            <option value="All">All plans</option><option value="Free">Free</option><option value="Premium">Premium</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin dashboard-muted" /></div>
        ) : visibleApps.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleApps.map((app) => {
              return <article
                key={app.slug}
                role="button"
                tabIndex={0}
                aria-label={`View ${app.name}`}
                onClick={() => openApp(app)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openApp(app);
                  }
                }}
                className="group relative flex min-h-[230px] cursor-pointer flex-col rounded-[22px] border dashboard-border dashboard-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/60 hover:shadow-xl hover:shadow-[#1349A3]/5 focus:outline-none focus:ring-4 focus:ring-[#1349A3]/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                    {/* Brand marks are served by Simple Icons so they stay crisp at every size. */}
                    <img src={logoUrl(app.slug)} alt={`${app.name} logo`} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center gap-2 pr-10">
                    {app.featured && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">Popular</span>}
                    {app.functional ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${app.plan === "Free" ? "bg-emerald-500/10 text-emerald-600" : "bg-[#1349A3]/10 text-[#1349A3] dark:text-blue-300"}`}>{app.plan === "Premium" && <Crown className="h-3 w-3" />}{app.plan}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600"><Clock className="h-3 w-3" />Coming soon</span>
                    )}
                  </div>
                </div>
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#1349A3]/10 text-[#1349A3] transition group-hover:bg-[#1349A3] group-hover:text-white dark:text-blue-300" aria-hidden="true">
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <div className="mt-4 flex-1">
                  <div className="text-xs font-medium dashboard-muted">{app.category}</div>
                  <h2 className="mt-1 text-lg font-semibold">{app.name}</h2>
                  <p className="mt-2 text-sm leading-5 dashboard-muted">{app.description}</p>
                </div>
                {app.installed && <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Connected</div>}
              </article>;
            })}
          </div>
        ) : (
          <div className="rounded-[22px] border dashboard-border dashboard-card py-20 text-center"><LayoutGrid className="dashboard-muted mx-auto h-8 w-8" /><h2 className="mt-3 font-semibold">No apps found</h2><p className="mt-1 text-sm dashboard-muted">Try another search, category, or plan.</p></div>
        )}
      </div>

      {selected && (
        <DashboardModalPortal onClose={() => setSelectedSlug(null)}>
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && setSelectedSlug(null)}>
          <div role="dialog" aria-modal="true" aria-label={`${selected.name} integration details`} className="dashboard-modal-surface max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border dashboard-border p-6 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3 shadow ring-1 ring-black/5"><img src={logoUrl(selected.slug)} alt={`${selected.name} logo`} className="h-full w-full object-contain" /></div><div><div className="text-xs dashboard-muted">{selected.category}</div><h2 className="text-xl font-semibold">{selected.name}</h2></div></div>
              <button onClick={() => setSelectedSlug(null)} aria-label="Close" className="rounded-xl p-2 dashboard-hover"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-5 text-sm leading-6 dashboard-muted">{selected.description}</p>

            {selected.functional ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl dashboard-subtle p-3"><ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" /><div className="font-semibold">Secure connection</div><div className="mt-1 dashboard-muted">Your credentials stay protected</div></div><div className="rounded-xl dashboard-subtle p-3"><Zap className="mb-2 h-4 w-4 text-amber-500" /><div className="font-semibold">Quick setup</div><div className="mt-1 dashboard-muted">Connect in just a few steps</div></div></div>
                <div className="mt-5 space-y-4">
                  {selected.configFields?.map((field) => (
                    <label key={field.key} className="block text-xs font-medium dashboard-muted">
                      {field.label}
                      <input
                        value={fields[field.key] || ""}
                        onChange={(event) => setFields((current) => ({ ...current, [field.key]: event.target.value }))}
                        placeholder={field.placeholder}
                        className="dashboard-input mt-1.5 w-full rounded-xl p-3 text-sm text-current"
                      />
                      <span className="mt-1 block text-[11px] dashboard-faint">{field.helpText}</span>
                    </label>
                  ))}
                </div>
                {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
                <div className="mt-6 flex gap-2">
                  <button disabled={saving} onClick={() => void connect()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1349A3] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1D5FC7] disabled:opacity-60">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {selected.installed ? "Save changes" : "Connect"}
                  </button>
                  {selected.installed && (
                    <button disabled={saving} onClick={() => void disconnect()} className="rounded-xl border dashboard-border px-4 py-3 text-sm font-semibold dashboard-hover disabled:opacity-60">Disconnect</button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300"><Clock className="h-4 w-4" /> Coming soon</div>
                <p className="mt-1.5 dashboard-muted">We&apos;re still building the {selected.name} integration. It&apos;ll appear here once it&apos;s ready to connect.</p>
              </div>
            )}
          </div>
        </div>
        </DashboardModalPortal>
      )}
    </div>
  );
}
