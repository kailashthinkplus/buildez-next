"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, FileText, Loader2, Paperclip, Send, Sparkles, Square, X } from "lucide-react";

export type V12AgentEvent = Readonly<{
  id: string;
  type: "message" | "tool.started" | "tool.completed" | "tool.failed";
  title: string;
  detail?: string;
  timestamp: string;
  role?: "user" | "assistant";
}>;

export default function V12AgentPanel({
  connected,
  events,
  running,
  onSubmit,
  onCancel,
  onClose,
}: {
  connected: boolean;
  events: readonly V12AgentEvent[];
  running: boolean;
  onSubmit(prompt: string, mode: "auto" | "discuss", attachments: readonly File[]): Promise<void>;
  onCancel(): void;
  onClose(): void;
}) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"auto" | "discuss">("auto");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  async function submit() {
    const value = prompt.trim();
    if ((!value && attachments.length === 0) || !connected) return;
    setPrompt("");
    const submittedAttachments = attachments;
    setAttachments([]);
    await onSubmit(value, mode, submittedAttachments);
  }

  return <aside className="flex h-full w-[360px] shrink-0 flex-col bg-[#15171c]">
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
      <div><strong>Build with AI</strong><p className="mt-0.5 text-xs text-white/40">Create and refine your website</p></div>
      <button onClick={onClose} aria-label="Close AI panel" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
    </div>

    <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
      {!events.length && <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-white/45">Describe the website, page, or focused change you want. Agent activity will appear here only after a real operation occurs.</div>}
      {events.map((event) => event.type === "message" ? (
        <div key={event.id} className={`flex ${event.role === "assistant" ? "mr-6 justify-start" : "ml-8 justify-end"}`}>
          <div className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-6 shadow-md ${event.role === "assistant" ? "rounded-bl-md border border-white/10 bg-[#242833] text-white/90 shadow-black/20" : "rounded-br-md bg-blue-600 text-white shadow-blue-950/30"}`}>
            {event.title}
            {event.detail && <div className="mt-1 text-[11px] text-blue-100/70">{event.detail}</div>}
          </div>
        </div>
      ) : (
        <details key={event.id} className="rounded-xl border border-white/10 bg-white/[0.045] p-3" open={event.type === "tool.failed"}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm"><ChevronRight size={14} className="text-white/40"/><span className="flex-1">{event.title}</span><span className={`h-2 w-2 rounded-full ${event.type === "tool.failed" ? "bg-red-400" : event.type === "tool.completed" ? "bg-emerald-400" : "bg-blue-400"}`}/></summary>
          {event.detail && <p className="mt-2 pl-6 text-xs leading-5 text-white/50">{event.detail}</p>}
        </details>
      ))}
      {running && <div className="overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-sky-400/[0.03] p-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3"><span className="relative grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><Sparkles size={18} className="animate-pulse"/><span className="absolute inset-0 animate-ping rounded-xl border border-blue-400/20"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-medium text-white"><Loader2 size={15} className="animate-spin text-blue-300"/>BuildEZ is working</div><p className="mt-1 text-xs text-white/45">Analyzing, designing and engineering your page</p></div><span className="font-mono text-xs tabular-nums text-blue-200/65">{elapsedLabel}</span></div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full w-1/3 animate-[ai-agent-progress_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-sky-300 to-blue-500"/></div>
        {elapsed >= 90 && <p className="mt-3 text-[11px] leading-4 text-white/40">Complex reference builds can take several minutes. You can stop safely at any time.</p>}
      </div>}
    </div>

    <div className="border-t border-white/10 p-3">
      {attachments.length > 0 && <div className="mb-2 space-y-2">{attachments.map((file, index) => <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-100"><FileText size={15}/><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-blue-200/50">{Math.max(1, Math.round(file.size / 1024))} KB</span><button onClick={() => setAttachments(files => files.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`} className="rounded p-1 hover:bg-white/10"><X size={13}/></button></div>)}</div>}
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="What would you like to build or change?" className="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-400" />
      <div className="mt-2 flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => { const selected = Array.from(event.target.files ?? []).filter(file => file.size <= 20 * 1024 * 1024); setAttachments(current => [...current, ...selected].slice(0, 5)); event.target.value = ""; }}/>
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach design PDF or image" title="Attach design PDF or image" className="rounded-lg p-2 text-white/55 hover:bg-white/10"><Paperclip size={16}/></button>
        <select value={mode} onChange={(event) => setMode(event.target.value as "auto" | "discuss")} className="rounded-lg bg-white/5 px-2 py-2 text-xs"><option value="auto">Auto</option><option value="discuss">Discuss</option></select>
        <div className="flex-1"/>
        {running ? <button onClick={onCancel} aria-label="Stop agent" className="rounded-lg bg-white px-3 py-2 text-black"><Square size={15}/></button> : <button onClick={submit} disabled={!connected || (!prompt.trim() && attachments.length === 0)} aria-label="Send message" className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500 disabled:opacity-30"><Send size={15}/></button>}
      </div>
    </div>
  </aside>;
}
