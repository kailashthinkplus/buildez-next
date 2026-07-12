"use client";
import { useState } from "react";
import { ArrowUp, Globe, Image as ImageIcon, Mic, Paperclip, Search, Sparkles, WandSparkles } from "lucide-react";

export default function CopilotPromptCard({contextLabel="All websites",subtitle="Ask BuildEZ to create, edit, or improve anything."}:{contextLabel?:string;subtitle?:string}) {
 const [value,setValue]=useState(""); const [mode,setMode]=useState("Create");
 return <div className="dashboard-card relative mt-0 overflow-hidden rounded-2xl p-5 sm:p-6 text-left">
  <div className="relative flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles size={18}/></span><div><h2 className="font-semibold">AI website assistant</h2><p className="text-xs dashboard-muted">{subtitle}</p></div><span className="ml-auto rounded-full border dashboard-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide dashboard-muted">{mode}</span></div>
  <div className="mt-5 grid gap-2 sm:grid-cols-3">
   <Prompt tone="violet" icon={WandSparkles} title="Create a section" text="Generate a polished new section" onClick={()=>setValue("Create a new section for my website")}/><Prompt tone="emerald" icon={Search} title="Improve SEO" text="Optimize pages and website copy" onClick={()=>setValue("Review and improve my website SEO")}/><Prompt tone="amber" icon={ImageIcon} title="Generate visuals" text="Create on-brand website images" onClick={()=>setValue("Create on-brand visuals for my website")}/>
  </div>
  <div className="relative mt-4 rounded-2xl border dashboard-border bg-[var(--dashboard-surface-hover)] p-3">
   <textarea value={value} onChange={e=>setValue(e.target.value)} rows={4} placeholder="Ask BuildEZ anything about your website..." className="w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-[var(--dashboard-faint)]"/>
   <div className="flex flex-wrap items-center gap-1.5 border-t dashboard-border pt-3">
    <Tool icon={Paperclip} label="Attach"/><Tool icon={ImageIcon} label="Create image"/><Tool icon={Search} label="Search web"/>
    <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg dashboard-hover dashboard-muted"><Mic size={16}/></button><button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500"><ArrowUp size={16}/></button>
   </div>
  </div>
  <div className="mt-3 flex items-center gap-1 text-[11px] dashboard-faint"><Globe size={12}/><span>Working in {contextLabel}</span></div>
 </div>
}
function Tool({icon:Icon,label}:{icon:any;label:string}) { return <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs dashboard-muted dashboard-hover"><Icon size={14}/><span className="hidden sm:inline">{label}</span></button> }
function Prompt({icon:Icon,title,text,onClick,tone}:{icon:any;title:string;text:string;onClick:()=>void;tone:string}) { return <button onClick={onClick} className={`ai-prompt ai-prompt-${tone} rounded-xl border dashboard-border p-3 text-left`}><span className="ai-prompt-icon flex h-7 w-7 items-center justify-center rounded-lg"><Icon size={15}/></span><p className="mt-2 text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] leading-4 dashboard-muted">{text}</p></button> }
