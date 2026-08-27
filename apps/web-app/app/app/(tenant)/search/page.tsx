"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

type Result = { id: string; type: string; title: string; subtitle: string; href: string };

export default function PlatformSearchPage() {
  const params = useSearchParams();
  const query = (params.get("q") || "").trim();
  const [results,setResults] = useState<Result[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{let cancelled=false;if(query.length<2){setResults([]);setLoading(false);return;}setLoading(true);fetch(`/api/search?q=${encodeURIComponent(query)}`,{cache:"no-store"}).then(response=>response.json()).then(payload=>{if(!cancelled)setResults(Array.isArray(payload.results)?payload.results:[])}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[query]);
  return <main className="mx-auto max-w-5xl pb-14"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Search size={20}/></span><div><h1 className="text-2xl font-semibold">Search results</h1><p className="text-sm dashboard-muted">Websites, pages, media, CMS, products and platform links for “{query}”</p></div></div>{loading?<div className="grid h-64 place-items-center"><Loader2 className="animate-spin text-blue-500"/></div>:results.length?<div className="mt-7 overflow-hidden rounded-2xl border dashboard-border dashboard-card">{results.map(result=><Link key={result.id} href={result.href} className="flex items-center gap-4 border-b dashboard-border p-4 last:border-0 dashboard-hover"><span className="min-w-16 rounded-lg bg-blue-500/10 px-2 py-1 text-center text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-300">{result.type}</span><span className="min-w-0"><strong className="block truncate text-sm">{result.title}</strong><span className="block truncate text-xs dashboard-muted">{result.subtitle}</span></span><ArrowRight size={16} className="ml-auto dashboard-faint"/></Link>)}</div>:<div className="dashboard-card mt-7 rounded-2xl p-12 text-center"><Search className="mx-auto dashboard-faint"/><h2 className="mt-3 font-semibold">No results found</h2><p className="mt-1 text-sm dashboard-muted">Try a website, page, product, file, collection or feature name.</p></div>}</main>;
}
