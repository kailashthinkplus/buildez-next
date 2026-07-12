"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Eye, FileText, MousePointerClick, MoreHorizontal, Plus, Sparkles, Users, Lightbulb, X, Monitor, ExternalLink } from "lucide-react";
import CopilotPromptCard from "../../components/CopilotPromptCard";

const bars = [38, 62, 48, 76, 57, 88, 64, 92, 70, 82, 58, 74, 96, 78];

export default function SiteDashboardPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return (
    <div className="mx-auto max-w-[1500px] pb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm dashboard-muted">Website overview</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{greeting}</h1><p className="mt-1 text-sm dashboard-muted">Here’s what’s happening with <span className="font-medium text-current">{siteSlug}</span>.</p></div>
        <div className="flex gap-2"><Link href={`/app/${siteSlug}/pages`} className="rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover">Manage pages</Link><Link href={`/app/${siteSlug}/pages`} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"><Plus size={16}/> New page</Link></div>
      </div>

      <RecommendationBar />

      <section className="mb-6 mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Eye} label="Total visitors" value="12,840" change="+18.2%" tone="cyan" />
        <Metric icon={Users} label="Unique visitors" value="8,291" change="+11.4%" tone="violet" />
        <Metric icon={MousePointerClick} label="Conversions" value="624" change="+8.7%" tone="emerald" />
        <Metric icon={FileText} label="Published pages" value="14" change="2 drafts" tone="amber" neutral />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <div className="dashboard-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between"><div><h2 className="font-semibold">Visitor analytics</h2><p className="mt-1 text-xs dashboard-muted">Traffic across your website</p></div><button className="rounded-lg p-2 dashboard-hover"><MoreHorizontal size={18}/></button></div>
          <div className="mt-6 flex items-end gap-3"><span className="text-3xl font-semibold">12,840</span><span className="mb-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">↑ 18.2%</span></div>
          <div className="mt-7 flex h-52 items-end gap-2 border-b dashboard-border">
            {bars.map((height, i) => <div key={i} className="group flex h-full flex-1 items-end"><div className={`analytics-bar analytics-bar-${i % 5} w-full rounded-t-md`} style={{height:`${height}%`,animationDelay:`${i*35}ms`}} /></div>)}
          </div>
          <div className="mt-3 flex justify-between text-[10px] dashboard-faint"><span>Jun 28</span><span>Jul 1</span><span>Jul 4</span><span>Jul 7</span><span>Jul 11</span></div>
        </div>
        <div className="dashboard-card rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between"><div><h2 className="font-semibold">Top pages</h2><p className="mt-1 text-xs dashboard-muted">By page views</p></div><BarChart3 size={18} className="dashboard-muted"/></div>
          <div className="mt-5 space-y-1"><PageRow name="Home" path="/" value="5,248" width="90%" tone="cyan"/><PageRow name="Services" path="/services" value="3,106" width="68%" tone="violet"/><PageRow name="About" path="/about" value="2,481" width="51%" tone="emerald"/><PageRow name="Contact" path="/contact" value="1,224" width="34%" tone="amber"/></div>
          <Link href={`/app/${siteSlug}/pages`} className="mt-5 flex items-center justify-center gap-1 border-t dashboard-border pt-4 text-xs font-medium text-blue-600 dark:text-blue-400">View all pages <ArrowUpRight size={13}/></Link>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <WebsitePreview siteSlug={siteSlug}/>
        <CopilotPromptCard contextLabel={`${siteSlug} website`} />
      </section>
    </div>
  );
}

function Metric({icon:Icon,label,value,change,neutral,tone}:{icon:any;label:string;value:string;change:string;neutral?:boolean;tone:"cyan"|"violet"|"emerald"|"amber"}) { return <div className={`dashboard-card metric-card metric-${tone} rounded-2xl p-5`}><div className="flex items-center justify-between"><span className="metric-icon flex h-10 w-10 items-center justify-center rounded-xl"><Icon size={18}/></span><span className={neutral?"text-xs dashboard-muted":"metric-change text-xs font-semibold"}>{change}</span></div><p className="mt-5 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs dashboard-muted">{label}</p></div> }
function PageRow({name,path,value,width,tone}:{name:string;path:string;value:string;width:string;tone:string}) { return <div className="rounded-xl p-3 dashboard-hover"><div className="flex justify-between text-sm"><div><span className="font-medium">{name}</span><span className="ml-2 text-xs dashboard-faint">{path}</span></div><span className="dashboard-muted">{value}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[.05] dark:bg-white/[.06]"><div className={`page-progress progress-${tone} h-full rounded-full`} style={{width}}/></div></div> }
function Suggestion({title,action}:{title:string;action:string}) { return <div className="rounded-xl border dashboard-border p-3"><p className="text-sm font-medium">{title}</p><button className="mt-3 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-300">{action}</button></div> }
function RecommendationBar(){return <section className="ai-recommendations rounded-2xl p-3"><div className="relative flex items-center gap-2 px-1 pb-3 text-sm"><span className="ai-recommendations-icon flex h-8 w-8 items-center justify-center rounded-xl"><Lightbulb size={16}/></span><span className="font-semibold">AI recommendations</span><span className="dashboard-muted">3 opportunities to improve your website</span><span className="ml-auto rounded-full bg-white/50 px-2 py-1 text-[10px] font-semibold dark:bg-white/[.06]">LIVE INSIGHTS</span></div><div className="relative grid gap-2 lg:grid-cols-3"><Recommendation text="Your homepage title can rank better with a clearer keyword." action="Improve SEO"/><Recommendation text="Visitors are leaving before reaching your primary call to action." action="Add CTA"/><Recommendation text="Social proof could improve trust on your services page." action="Add testimonials"/></div></section>}
function Recommendation({text,action}:{text:string;action:string}){return <div className="ai-recommendation-card rounded-xl p-3"><div className="flex gap-2"><p className="text-xs leading-5 dashboard-muted">{text}</p><button aria-label="Dismiss" className="ml-auto self-start dashboard-faint"><X size={14}/></button></div><button className="mt-3 rounded-lg border dashboard-border px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300">{action}</button></div>}
function WebsitePreview({siteSlug}:{siteSlug:string}){return <div className="dashboard-card rounded-2xl p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Website preview</h2><p className="mt-1 text-xs dashboard-muted">Latest published version</p></div><Link href={`/${siteSlug}`} className="rounded-lg p-2 dashboard-hover" aria-label="Open website"><ExternalLink size={16}/></Link></div><div className="mt-5 overflow-hidden rounded-xl border dashboard-border bg-[var(--dashboard-bg-soft)]"><div className="flex h-8 items-center gap-1.5 border-b dashboard-border bg-[var(--dashboard-surface)] px-3"><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600"/><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600"/><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600"/></div><div className="flex aspect-[4/3] flex-col items-center justify-center p-6 text-center"><Monitor size={28} className="text-blue-600 dark:text-blue-400"/><p className="mt-3 text-sm font-semibold">{siteSlug}</p><p className="mt-1 text-xs dashboard-muted">Your live website preview</p><Link href={`/${siteSlug}`} className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white">View website</Link></div></div></div>}
