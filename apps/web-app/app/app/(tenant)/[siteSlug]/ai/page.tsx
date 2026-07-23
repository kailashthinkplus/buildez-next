"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight, BarChart3, Check, ChevronRight, FilePenLine, Lightbulb,
  LoaderCircle, Mail, MessageCircle, Search, Send, ShoppingBag, Sparkles,
  Target, Users, X, type LucideIcon,
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";

type QuickAction = { title: string; help: string; prompt: string; icon: LucideIcon };

const actions: QuickAction[] = [
  { title: "Create marketing content", help: "Social posts, emails, and website copy", prompt: "Create marketing content for my business", icon: FilePenLine },
  { title: "Follow up with leads", help: "Write personal replies for new enquiries", prompt: "Help me follow up with my newest leads", icon: Users },
  { title: "Improve my website", help: "Find simple ways to get more enquiries", prompt: "Review my website and suggest the most important improvements", icon: Search },
  { title: "Grow online sales", help: "Promote products and improve store results", prompt: "Help me find ways to grow my online sales", icon: ShoppingBag },
  { title: "Plan this week", help: "Turn priorities into a practical action plan", prompt: "Help me plan the most important work for this week", icon: Target },
  { title: "Reply to customers", help: "Draft clear, helpful customer responses", prompt: "Help me reply to a customer", icon: MessageCircle },
];

export default function AIAgentsPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const { currentWebsite } = useWorkspace();
  const [prompt, setPrompt] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState("");
  const [briefingOpen, setBriefingOpen] = useState(true);
  const business = currentWebsite?.name || siteSlug;
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  }, []);

  function start(value = prompt) {
    const task = value.trim();
    if (!task || working) return;
    setPrompt(task);
    setWorking(true);
    setResult("");
    setTimeout(() => {
      setWorking(false);
      setResult(`I’m ready to help with “${task}”. I’ll use your website, brand, customers, and business information to prepare the next steps for your approval.`);
    }, 900);
  }

  return <div className="ai-simple mx-auto max-w-[1380px] pb-14">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">{greeting}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-.045em]">What would you like to get done?</h1>
        <p className="mt-2 text-sm dashboard-muted">Your BuildEZ AI team can help with everyday work for {business}.</p>
      </div>
      <button className="rounded-xl border dashboard-border px-4 py-2.5 text-sm dashboard-hover">Your AI team</button>
    </header>

    <section className="ai-simple-ask relative mt-7 overflow-hidden rounded-[26px] p-5 sm:p-7">
      <div className="ai-simple-glow pointer-events-none absolute inset-0"/>
      <div className="relative grid items-center gap-6 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Sparkles size={17}/></span>Ask BuildEZ to help</div>
          <p className="mt-4 max-w-lg text-sm leading-6 dashboard-muted">Tell us what you need. Your AI helper can prepare the work while you stay in control and approve the result.</p>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-200/70 bg-white p-3 shadow-sm dark:border-blue-300/10 dark:bg-[#10182a] sm:flex-row">
            <textarea value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") start(); }} placeholder="For example: Write a promotion for my best-selling product…" className="min-h-16 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-slate-400"/>
            <button onClick={() => start()} disabled={!prompt.trim() || working} className="flex h-11 shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-40">{working ? <LoaderCircle size={16} className="animate-spin"/> : <Send size={16}/>}Get help</button>
          </div>
          {result && <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-white/75 p-4 text-sm leading-6 text-slate-700 dark:border-blue-300/10 dark:bg-white/[.045] dark:text-slate-300"><Check className="mt-1 shrink-0 text-blue-500" size={16}/><p>{result}</p><button onClick={() => setResult("")} className="ml-auto shrink-0 dashboard-faint"><X size={15}/></button></div>}
        </div>
        <div className="ai-helper-art relative min-h-[240px] overflow-hidden rounded-2xl border border-white/60 bg-white/50 shadow-xl shadow-blue-900/5 dark:border-white/10 dark:bg-white/[.04]">
          <Image src="/ai-agents/ai-working-for-you.png" alt="AI helper preparing marketing, customer replies, sales insights, and weekly plans for your business" fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover"/>
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-xs font-medium text-slate-700 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"/>Working across marketing, customers, sales, and planning</div>
        </div>
      </div>
    </section>

    <section className="mt-8">
      <div><h2 className="text-lg font-semibold">Popular ways I can help</h2><p className="mt-1 text-xs dashboard-muted">Choose a task to get started quickly.</p></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{actions.map(action => <button key={action.title} onClick={() => { setPrompt(action.prompt); start(action.prompt); }} className="ai-task-card group flex items-center gap-4 rounded-2xl border dashboard-border p-4 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300"><action.icon size={19}/></span>
        <span className="min-w-0"><strong className="text-sm font-semibold">{action.title}</strong><span className="mt-1 block text-xs dashboard-muted">{action.help}</span></span>
        <ChevronRight size={16} className="ml-auto shrink-0 dashboard-faint transition group-hover:translate-x-1 group-hover:text-blue-500"/>
      </button>)}</div>
    </section>

    <section className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <article className="dashboard-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Lightbulb size={17} className="text-blue-500"/><h2 className="font-semibold">Today’s business briefing</h2></div><p className="mt-1 text-xs dashboard-muted">The few things worth your attention today.</p></div><button onClick={() => setBriefingOpen(value => !value)} className="rounded-lg px-3 py-2 text-xs dashboard-hover">{briefingOpen ? "Hide" : "Show"}</button></div>
        {briefingOpen && <div className="mt-5 space-y-3">
          <Brief icon={Users} title="3 new enquiries need a reply" detail="Following up today may improve your chance of converting them." action="Draft replies"/>
          <Brief icon={BarChart3} title="Your services page is getting attention" detail="Visitors are viewing it, but the next step could be clearer." action="Suggest an improvement"/>
          <Brief icon={Mail} title="This week’s customer email is not planned" detail="BuildEZ can draft one using your latest products or updates." action="Create email"/>
        </div>}
      </article>

      <article className="dashboard-card rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold">Recently completed</h2>
        <p className="mt-1 text-xs dashboard-muted">Work prepared by your AI team.</p>
        <div className="mt-5 space-y-1">
          <Recent title="Homepage improvement ideas" time="Today"/>
          <Recent title="Replies for new enquiries" time="Yesterday"/>
          <Recent title="Weekend promotion copy" time="2 days ago"/>
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-1 border-t dashboard-border pt-4 text-xs font-medium text-blue-600 dark:text-blue-300">View all completed work <ArrowRight size={13}/></button>
      </article>
    </section>
  </div>;
}

function Brief({ icon: Icon, title, detail, action }: { icon: LucideIcon; title: string; detail: string; action: string }) {
  return <div className="ai-brief flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Icon size={17}/></span><div className="min-w-0"><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 dashboard-muted">{detail}</p></div><button className="shrink-0 rounded-lg border dashboard-border px-3 py-2 text-xs font-medium text-blue-600 dashboard-hover dark:text-blue-300">{action}</button></div>;
}

function Recent({ title, time }: { title: string; time: string }) {
  return <button className="flex w-full items-center gap-3 rounded-xl p-3 text-left dashboard-hover"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={14}/></span><span className="min-w-0 flex-1 truncate text-sm">{title}</span><span className="text-[10px] dashboard-faint">{time}</span></button>;
}
