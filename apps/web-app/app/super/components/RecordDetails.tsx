"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, Database, Loader2 } from "lucide-react";

type Payload = { title: string; subtitle: string; type: string; record: Record<string, unknown> };
const HIDDEN = /password|secret|hash|recoverycodes|signature/i;

export default function RecordDetails({ type, id }: { type: string; id: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/super/details/${type}/${encodeURIComponent(id)}`, { cache: "no-store" }).then(async r => { const body = await r.json(); if (!r.ok) throw new Error(body.error || "Unable to load details"); return body; }).then(setData).catch(e => setError(e instanceof Error ? e.message : "Unable to load details")); }, [type, id]);
  if (error) return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-600 dark:text-rose-300">{error}</div>;
  if (!data) return <div className="dashboard-card flex h-64 items-center justify-center rounded-3xl"><Loader2 className="animate-spin dashboard-muted" /></div>;
  const primitives = Object.entries(data.record).filter(([key, value]) => !HIDDEN.test(key) && (value === null || ["string", "number", "boolean"].includes(typeof value)));
  const groups = Object.entries(data.record).filter(([key, value]) => !HIDDEN.test(key) && value !== null && typeof value === "object");
  return <div>
    <Link href={`/super/${type}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold dashboard-muted hover:text-blue-600"><ArrowLeft size={16}/> Back to {type}</Link>
    <section className="relative overflow-hidden rounded-[30px] border dashboard-border bg-[#07101d] text-white shadow-xl"><Image src="/dashboard/buildez-workspace-aurora.svg" alt="" fill priority className="object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent"/><div className="relative p-7 sm:p-9"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"><Database size={13}/> {labelize(type)} record</div><h1 className="mt-5 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{data.title}</h1><p className="mt-2 text-sm text-white/65">{data.subtitle}</p></div></section>
    <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{primitives.map(([key, value]) => <div key={key} className="dashboard-card rounded-2xl p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">{labelize(key)}</p><div className="mt-2 break-words text-sm font-semibold">{formatValue(value)}</div></div>)}</section>
    <section className="mt-6 grid gap-5 xl:grid-cols-2">{groups.map(([key, value]) => <div key={key} className="dashboard-card rounded-3xl p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">Related data</p><h2 className="mt-1 text-lg font-semibold">{labelize(key)}</h2></div><span className="rounded-full border dashboard-border px-2.5 py-1 text-xs dashboard-muted">{Array.isArray(value) ? value.length : "Details"}</span></div><ObjectView value={value} /></div>)}</section>
  </div>;
}

function ObjectView({ value }: { value: unknown }) {
  if (Array.isArray(value)) return value.length ? <div className="space-y-2">{value.map((item, index) => <div key={index} className="rounded-xl border dashboard-border bg-[var(--dashboard-surface)] p-3"><ObjectView value={item}/></div>)}</div> : <p className="py-5 text-center text-sm dashboard-muted">No records</p>;
  if (value && typeof value === "object") return <dl className="grid gap-2">{Object.entries(value as Record<string, unknown>).filter(([key]) => !HIDDEN.test(key)).map(([key, nested]) => <div key={key} className="grid grid-cols-[120px_1fr] gap-3 text-xs"><dt className="dashboard-muted">{labelize(key)}</dt><dd className="break-words font-medium">{nested && typeof nested === "object" ? JSON.stringify(nested) : formatValue(nested)}</dd></div>)}</dl>;
  return <span className="text-sm">{formatValue(value)}</span>;
}
function labelize(value: string) { return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/^./, c => c.toUpperCase()); }
function formatValue(value: unknown) { if (value === null || value === undefined || value === "") return "—"; if (typeof value === "boolean") return value ? "Yes" : "No"; if (typeof value === "string" && /^\d{4}-\d\d-\d\dT/.test(value)) return new Date(value).toLocaleString(); return String(value); }
