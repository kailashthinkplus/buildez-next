"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity, ArrowUpRight, Bot, BrainCircuit, ChevronRight, CircleDot,
  Clock3, Command, Cpu, Gauge, LoaderCircle, MessageSquareText, Orbit, Play,
  Plus, Radio, Send, ShieldCheck, Sparkles, Target, TrendingUp, WandSparkles, X,
  type LucideIcon,
} from "lucide-react";
import { useWorkspace } from "../../components/WorkspaceContext";

type Agent = {
  id: string; name: string; role: string; description: string; status: "active" | "training" | "paused";
  icon: LucideIcon; color: string; glow: string; runs: number; success: number; saved: string;
};

const initialAgents: Agent[] = [
  { id: "growth", name: "Growth Strategist", role: "Marketing", description: "Finds opportunities, plans campaigns, and turns traffic signals into growth experiments.", status: "active", icon: TrendingUp, color: "#3788ff", glow: "rgba(55,136,255,.28)", runs: 142, success: 96, saved: "18h" },
  { id: "sales", name: "Sales Concierge", role: "Revenue", description: "Qualifies inbound leads, drafts replies, and keeps every promising conversation moving.", status: "active", icon: Target, color: "#38d9ff", glow: "rgba(56,217,255,.25)", runs: 89, success: 94, saved: "12h" },
  { id: "content", name: "Content Director", role: "Brand", description: "Plans, creates, and repurposes on-brand content across your site and campaigns.", status: "active", icon: WandSparkles, color: "#75a7ff", glow: "rgba(117,167,255,.24)", runs: 217, success: 98, saved: "27h" },
  { id: "support", name: "Customer Success", role: "Support", description: "Answers questions, identifies friction, and escalates the conversations that need a human.", status: "training", icon: MessageSquareText, color: "#5ee6a8", glow: "rgba(94,230,168,.22)", runs: 34, success: 91, saved: "7h" },
  { id: "commerce", name: "Commerce Operator", role: "ShopEZ", description: "Monitors products, stock, customers, and orders to surface the next best action.", status: "paused", icon: Cpu, color: "#ffbd63", glow: "rgba(255,189,99,.22)", runs: 76, success: 93, saved: "10h" },
];

export default function AIAgentsPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const { currentWebsite } = useWorkspace();
  const root = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState(initialAgents);
  const [selected, setSelected] = useState("growth");
  const [command, setCommand] = useState("");
  const [running, setRunning] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activity, setActivity] = useState([
    ["Content Director", "Prepared a 4-week editorial plan", "2 min ago", "complete"],
    ["Growth Strategist", "Found a conversion opportunity on the pricing page", "12 min ago", "insight"],
    ["Sales Concierge", "Qualified 3 new leads from website forms", "28 min ago", "complete"],
    ["Customer Success", "Learning from 18 recent support conversations", "1 hr ago", "training"],
  ]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${((event.clientX - box.left) / box.width - .5) * 2}`);
      node.style.setProperty("--my", `${((event.clientY - box.top) / box.height - .5) * 2}`);
    };
    node.addEventListener("pointermove", move);
    return () => node.removeEventListener("pointermove", move);
  }, []);

  const active = agents.filter(agent => agent.status === "active").length;
  const totalRuns = agents.reduce((sum, agent) => sum + agent.runs, 0);
  const average = Math.round(agents.reduce((sum, agent) => sum + agent.success, 0) / agents.length);
  const chosen = agents.find(agent => agent.id === selected) ?? agents[0];
  const chart = useMemo(() => [34, 48, 42, 67, 58, 76, 69, 91, 82, 104, 96, 124], []);

  function runCommand() {
    const value = command.trim();
    if (!value || running) return;
    setRunning(true);
    setTimeout(() => {
      setActivity(rows => [[chosen.name, value, "Just now", "complete"], ...rows]);
      setCommand("");
      setRunning(false);
    }, 1200);
  }

  return <div ref={root} className="agent-os relative mx-auto min-h-[calc(100vh-110px)] max-w-[1580px] overflow-hidden rounded-[30px] border border-white/10 text-white">
    <div className="agent-aurora pointer-events-none absolute inset-0"/>
    <div className="agent-grid pointer-events-none absolute inset-0"/>
    <div className="agent-orb agent-orb-a pointer-events-none"/><div className="agent-orb agent-orb-b pointer-events-none"/>
    <div className="relative z-10 p-5 sm:p-7 xl:p-9">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-blue-200/75"><span className="agent-live"/><Orbit size={14}/> BuildEZ AI Agents</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-5xl">Meet your <span className="agent-gradient">AI business team.</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300/70">Get everyday help with marketing, sales, content, customers, and your online store—all in one simple workspace for {currentWebsite?.name || siteSlug}.</p>
        </div>
        <div className="flex items-center gap-2"><button className="agent-glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs text-slate-200"><ShieldCheck size={15} className="text-blue-300"/>AI preferences</button><button onClick={() => setCreateOpen(true)} className="agent-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"><Plus size={15}/>Add an AI helper</button></div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Bot} label="AI helpers working" value={`${active}`} note={`${agents.length} available`} color="#3788ff"/>
        <Metric icon={Activity} label="Jobs completed" value={totalRuns.toLocaleString()} note="+24% this month" color="#55b7ff"/>
        <Metric icon={Gauge} label="Work completed well" value={`${average}%`} note="Across your AI team" color="#66d8bc"/>
        <Metric icon={Clock3} label="Time saved" value="74h" note="This month" color="#75a7ff"/>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="agent-glass agent-depth rounded-[24px] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">What would you like help with?</p><p className="mt-1 text-xs text-slate-400">Choose a team member, then describe what you need in your own words.</p></div><span className="flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-300/[.07] px-3 py-1.5 text-[10px] font-semibold text-blue-200"><Radio size={11}/>READY TO HELP</span></div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{agents.map(agent => <button key={agent.id} onClick={() => setSelected(agent.id)} className={`agent-chip flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs ${selected === agent.id ? "active" : ""}`}><agent.icon size={14} style={{ color: agent.color }}/>{agent.name}</button>)}</div>
          <div className="agent-command mt-3 rounded-2xl p-4">
            <textarea value={command} onChange={event => setCommand(event.target.value)} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") runCommand(); }} placeholder={`For example: Ask ${chosen.name} to plan next week's priorities…`} className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-500"/>
            <div className="flex items-center justify-between border-t border-white/[.07] pt-3"><span className="flex items-center gap-1.5 text-[10px] text-slate-500"><Command size={11}/>⌘ Enter to send</span><button onClick={runCommand} disabled={!command.trim() || running} className="agent-primary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-40">{running ? <LoaderCircle className="animate-spin" size={14}/> : <Send size={14}/>}Ask for help</button></div>
          </div>
          <div className="mt-5 grid grid-cols-12 gap-1.5">{chart.map((value, index) => <div key={index} className="flex h-24 items-end"><i className="agent-bar w-full rounded-t-md" style={{ height: `${value / 1.3}%`, animationDelay: `${index * 45}ms` }}/></div>)}</div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500"><span>Work completed · last 12 weeks</span><span className="text-blue-200">31.8% more time saved</span></div>
        </div>

        <div className="agent-glass agent-depth rounded-[24px] p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Recent work</p><p className="mt-1 text-xs text-slate-400">A simple view of what your AI team has done.</p></div><CircleDot size={17} className="animate-pulse text-blue-300"/></div>
          <div className="mt-5 space-y-1">{activity.slice(0, 5).map(([name, task, time, state], index) => <div key={`${name}-${time}-${index}`} className="agent-activity flex gap-3 rounded-xl p-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${state === "training" ? "bg-amber-300" : state === "insight" ? "bg-violet-300" : "bg-cyan-300"}`}/><div className="min-w-0"><p className="text-[11px] font-semibold text-slate-200">{name}</p><p className="mt-1 text-xs leading-5 text-slate-400">{task}</p><p className="mt-1 text-[9px] text-slate-600">{time}</p></div></div>)}</div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-semibold tracking-tight">Your AI team</h2><p className="mt-1 text-xs text-slate-400">Choose the right helper for each part of your business.</p></div><button className="flex items-center gap-1 text-xs text-blue-200">Browse more helpers <ChevronRight size={14}/></button></div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{agents.map(agent => <AgentCard key={agent.id} agent={agent} onToggle={() => setAgents(items => items.map(item => item.id === agent.id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item))}/>)}</div>
      </section>
    </div>
    {createOpen && <CreateAgent onClose={() => setCreateOpen(false)} onCreate={(name, role) => { setAgents(items => [...items, { id: crypto.randomUUID(), name, role, description: "A new AI helper getting ready to support the way your business works.", status: "training", icon: BrainCircuit, color: "#3788ff", glow: "rgba(55,136,255,.28)", runs: 0, success: 0, saved: "0h" }]); setCreateOpen(false); }}/>}
  </div>;
}

function Metric({ icon: Icon, label, value, note, color }: { icon: LucideIcon; label: string; value: string; note: string; color: string }) {
  return <article className="agent-glass agent-metric rounded-2xl p-4"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ color, background: `${color}18`, boxShadow: `inset 0 0 0 1px ${color}22` }}><Icon size={17}/></span><ArrowUpRight size={14} className="text-slate-600"/></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><div className="mt-1 flex items-center justify-between text-[10px]"><span className="text-slate-400">{label}</span><span style={{ color }}>{note}</span></div></article>;
}

function AgentCard({ agent, onToggle }: { agent: Agent; onToggle(): void }) {
  return <article className="agent-card group relative overflow-hidden rounded-[22px] border border-white/[.08] p-5" style={{ "--agent-color": agent.color, "--agent-glow": agent.glow } as React.CSSProperties}>
    <div className="agent-card-glow pointer-events-none absolute inset-0"/><div className="relative">
      <div className="flex items-start"><span className="agent-icon grid h-11 w-11 place-items-center rounded-2xl"><agent.icon size={20}/></span><div className="ml-3"><h3 className="text-sm font-semibold">{agent.name}</h3><p className="mt-1 text-[10px] uppercase tracking-[.16em] text-slate-500">{agent.role}</p></div><button onClick={onToggle} className={`ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold ${agent.status === "active" ? "border-emerald-300/15 bg-emerald-300/[.07] text-emerald-200" : agent.status === "training" ? "border-amber-300/15 bg-amber-300/[.07] text-amber-200" : "border-white/10 bg-white/[.04] text-slate-400"}`}><i className={`h-1.5 w-1.5 rounded-full ${agent.status === "active" ? "animate-pulse bg-emerald-300" : agent.status === "training" ? "bg-amber-300" : "bg-slate-500"}`}/>{agent.status === "active" ? "Available" : agent.status === "training" ? "Getting ready" : "Paused"}</button></div>
      <p className="mt-4 min-h-12 text-xs leading-5 text-slate-400">{agent.description}</p>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[.06] pt-4"><Mini label="Jobs done" value={String(agent.runs)}/><Mini label="Done well" value={`${agent.success}%`}/><Mini label="Time saved" value={agent.saved}/></div>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[.07] bg-white/[.035] py-2.5 text-xs text-slate-300 transition hover:border-white/15 hover:bg-white/[.07]"><Play size={13}/>Work with this helper</button>
    </div>
  </article>;
}

function Mini({ label, value }: { label: string; value: string }) { return <div><p className="text-sm font-semibold text-slate-200">{value}</p><p className="mt-1 text-[9px] text-slate-600">{label}</p></div>; }

function CreateAgent({ onClose, onCreate }: { onClose(): void; onCreate(name: string, role: string): void }) {
  const [name, setName] = useState(""); const [role, setRole] = useState("Operations");
  return <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#03040a]/75 p-5 backdrop-blur-xl" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="agent-glass w-full max-w-md rounded-[26px] border border-white/10 p-6 shadow-2xl"><div className="flex items-start justify-between"><div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-400/10 text-blue-300"><BrainCircuit/></span><h2 className="mt-4 text-xl font-semibold">Add an AI helper</h2><p className="mt-2 text-xs leading-5 text-slate-400">Choose the part of your business it will help with. BuildEZ will guide you through the rest.</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/5"><X size={17}/></button></div><label className="mt-6 block text-xs text-slate-400">Helper name<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="e.g. My Finance Helper" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-blue-400/50"/></label><label className="mt-4 block text-xs text-slate-400">What should it help with?<select value={role} onChange={event => setRole(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111528] px-3 py-3 text-sm text-white outline-none"><option>Day-to-day operations</option><option>Marketing</option><option>Sales</option><option>Customer support</option><option>Online store</option><option>Finance</option></select></label><button onClick={() => name.trim() && onCreate(name.trim(), role)} disabled={!name.trim()} className="agent-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-40"><Sparkles size={15}/>Add to my AI team</button></div></div>;
}
