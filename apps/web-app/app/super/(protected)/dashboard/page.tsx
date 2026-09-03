"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Activity, Building2, CreditCard, Globe2, Loader2, ShieldCheck, Users } from "lucide-react";

type Overview = {
  stats: Record<string, number>;
  recentUsers: Array<{ id: string; email: string | null; name: string | null; role: string; isActive: boolean }>;
  recentTenants: Array<{ id: string; name: string; isActive: boolean; _count: { sites: number; users: number } }>;
  notifications: Array<{ id: string; title: string; message: string; createdAt: string }>;
};

export default function SuperDashboard() {
  const [data, setData] = useState<Overview>();
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/super/overview", { cache: "no-store" }).then(async response => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Platform overview unavailable"); return payload; }).then(setData).catch(reason => setError(reason instanceof Error ? reason.message : "Platform overview unavailable")); }, []);
  if (error) return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">{error}</div>;
  if (!data) return <div className="dashboard-card flex h-64 items-center justify-center rounded-3xl"><Loader2 className="animate-spin dashboard-muted"/></div>;
  return <>
    <section className="relative overflow-hidden rounded-[30px] border dashboard-border bg-[#07101d] text-white shadow-xl">
      <Image src="/dashboard/buildez-workspace-aurora.svg" alt="" fill priority className="object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent"/>
      <div className="relative flex min-h-[290px] flex-col justify-between gap-8 p-7 sm:p-9 lg:flex-row lg:items-end lg:p-11">
        <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"><ShieldCheck size={13}/> BuildEZ Platform</div><h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl lg:text-5xl">Operate every BuildEZ workspace from one place.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Manage users, tenants, websites, billing, support and customer relationships across the entire platform.</p></div>
        <Link href="/super/support" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"><Activity size={16}/> Review operations</Link>
      </div>
    </section>
    <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric href="/super/users" icon={Users} label="Users" value={data.stats.users} helper={`${data.stats.activeUsers} active`} tone="indigo"/>
      <Metric href="/super/tenants" icon={Building2} label="Tenants" value={data.stats.tenants} helper={`${data.stats.activeTenants} operational`} tone="cyan"/>
      <Metric href="/super/websites" icon={Globe2} label="Websites" value={data.stats.sites} helper={`${data.stats.publishedSites} published`} tone="emerald"/>
      <Metric href="/super/transactions" icon={CreditCard} label="Subscriptions" value={data.stats.subscriptions} helper="Active subscriptions" tone="violet"/>
    </section>
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <Panel title="Newest users" href="/super/users">{data.recentUsers.map(user => <Link key={user.id} href={`/super/users/${user.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 dashboard-hover"><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-600 dark:text-blue-300">{(user.name || user.email || "U")[0].toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name || "Unnamed user"}</p><p className="truncate text-xs dashboard-muted">{user.email}</p></div><Status active={user.isActive}>{user.role.replaceAll("_", " ")}</Status></Link>)}</Panel>
      <Panel title="Newest tenants" href="/super/tenants">{data.recentTenants.map(tenant => <Link key={tenant.id} href={`/super/tenants/${tenant.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 dashboard-hover"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><Building2 size={17}/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{tenant.name}</p><p className="text-xs dashboard-muted">{tenant._count.sites} sites · {tenant._count.users} members</p></div><Status active={tenant.isActive}>{tenant.isActive ? "Active" : "Suspended"}</Status></Link>)}</Panel>
    </section>
    <section className="dashboard-card mt-6 rounded-3xl p-5 sm:p-6"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.12em] dashboard-faint">Audit trail</p><h2 className="mt-1 text-lg font-semibold">Recent control activity</h2></div><div className="space-y-2">{data.notifications.length ? data.notifications.map(item => <div key={item.id} className="flex gap-3 rounded-xl border dashboard-border bg-[var(--dashboard-surface)] p-3"><Activity className="mt-0.5 text-blue-500" size={16}/><div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs dashboard-muted">{item.message} · {new Date(item.createdAt).toLocaleString(undefined, { hour12: true })}</p></div></div>) : <p className="py-6 text-center text-sm dashboard-muted">No recent control activity.</p>}</div></section>
  </>;
}

function Metric({ href, icon: Icon, label, value, helper, tone }: { href: string; icon: typeof Users; label: string; value: number; helper: string; tone: "indigo"|"cyan"|"emerald"|"violet" }) { const colors = { indigo:"bg-indigo-500/10 text-indigo-600 dark:text-indigo-300", cyan:"bg-cyan-500/10 text-cyan-600 dark:text-cyan-300", emerald:"bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", violet:"bg-violet-500/10 text-violet-600 dark:text-violet-300" }; return <Link href={href} className="dashboard-card rounded-3xl p-5 sm:p-6"><div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}><Icon size={18}/></div><p className="mt-5 text-xs font-semibold uppercase tracking-[.12em] dashboard-faint">{label}</p><p className="mt-1 text-3xl font-semibold tracking-[-.04em]">{new Intl.NumberFormat("en-IN",{notation:"compact"}).format(value)}</p><p className="mt-1 text-xs dashboard-muted">{helper}</p></Link>; }
function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) { return <div className="dashboard-card rounded-3xl p-5 sm:p-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><Link href={href} className="text-xs font-semibold text-blue-600 dark:text-blue-300">View all</Link></div><div className="divide-y dashboard-border">{children}</div></div>; }
function Status({ active, children }: { active: boolean; children: React.ReactNode }) { return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${active ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{children}</span>; }
