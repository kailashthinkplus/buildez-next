"use client";

import { FormEvent, useMemo, useState } from "react";
import { BookOpen, Bot, CheckCircle2, ChevronRight, LifeBuoy, Loader2, Search, Send, Ticket, X } from "lucide-react";

import { SUPPORT_ARTICLES, searchSupportArticles, type SupportArticle } from "@/modules/support/knowledge";
import { useWorkspace } from "../components/WorkspaceContext";

type ChatMessage = { role: "assistant" | "user"; text: string; sources?: Array<{ id: string; title: string }> };

export default function HelpCenterPage() {
  const { currentWebsite } = useWorkspace();
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState<SupportArticle>();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: "Hi! I’m your BuildEZ support agent. Ask me how to use a feature, troubleshoot an issue, or raise a ticket." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);
  const [ticketResult, setTicketResult] = useState("");
  const [ticket, setTicket] = useState({ subject: "", category: "Technical issue", priority: "normal", details: "" });
  const articles = useMemo(() => query.trim() ? searchSupportArticles(query, 10) : SUPPORT_ARTICLES, [query]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatBusy) return;
    setChatInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    setChatBusy(true);
    try {
      const response = await fetch("/api/support/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, siteId: currentWebsite?.id }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Support chat is unavailable");
      setMessages((current) => [...current, { role: "assistant", text: payload.answer, sources: payload.sources }]);
      if (payload.canRaiseTicket) {
        setTicket((current) => ({ ...current, subject: current.subject || text.slice(0, 100), details: current.details || text }));
      }
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "Support chat is unavailable" }]);
    } finally {
      setChatBusy(false);
    }
  }

  async function raiseTicket(event: FormEvent) {
    event.preventDefault();
    setTicketBusy(true);
    setTicketResult("");
    try {
      const response = await fetch("/api/support/tickets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...ticket, siteId: currentWebsite?.id }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Ticket could not be created");
      setTicketResult(`Ticket ${payload.ticket.ticketNumber} was created. Our support team can now track it.`);
      setTicket({ subject: "", category: "Technical issue", priority: "normal", details: "" });
    } catch (error) {
      setTicketResult(error instanceof Error ? error.message : "Ticket could not be created");
    } finally {
      setTicketBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] pb-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300"><LifeBuoy size={16} /> BuildEZ support</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Help center</h1><p className="mt-2 text-sm dashboard-muted">Browse practical guides or work with the intelligent support agent.</p></div>
        <button onClick={() => setTicketOpen(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"><Ticket size={16} /> Report an issue</button>
      </header>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="dashboard-card rounded-2xl p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold"><BookOpen size={17} className="text-blue-500" /> Support documentation</h2>
            <label className="mt-4 flex items-center gap-2 rounded-xl border dashboard-border px-3"><Search size={16} className="dashboard-faint" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages, domains, AI agents, ShopEZ…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></label>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {articles.map((item) => <button key={item.id} onClick={() => setArticle(item)} className="group rounded-xl border dashboard-border p-4 text-left dashboard-hover"><span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">{item.category}</span><div className="mt-1 flex items-start gap-2"><h3 className="flex-1 text-sm font-semibold">{item.title}</h3><ChevronRight size={15} className="dashboard-faint transition group-hover:translate-x-0.5" /></div><p className="mt-2 line-clamp-2 text-xs leading-5 dashboard-muted">{item.summary}</p></button>)}
            </div>
            {!articles.length && <p className="py-10 text-center text-sm dashboard-muted">No guide matched that search. Ask the support agent for help.</p>}
          </div>
          {article && <article className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-500/[.06] p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex-1"><span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">{article.category}</span><h2 className="mt-1 text-lg font-semibold">{article.title}</h2></div><button onClick={() => setArticle(undefined)} className="rounded-lg p-2 dashboard-hover"><X size={16} /></button></div><p className="mt-4 text-sm leading-7 dashboard-muted">{article.body}</p></article>}
        </div>

        <section className="dashboard-card flex min-h-[650px] flex-col overflow-hidden rounded-2xl">
          <header className="flex items-center gap-3 border-b dashboard-border p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-500"><Bot size={19} /></span><div><h2 className="text-sm font-semibold">AI support agent</h2><p className="text-[11px] dashboard-muted">Documentation-grounded · ticket enabled</p></div></header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-black/[.018] p-4 dark:bg-white/[.018]">
            {messages.map((message, index) => <div key={index} className={`max-w-[88%] rounded-2xl border px-3.5 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto border-blue-600 bg-blue-600 text-white" : "dashboard-border bg-[var(--dashboard-surface)]"}`}><p>{message.text}</p>{message.sources?.length ? <div className="mt-3 border-t border-current/10 pt-2 text-[10px] opacity-65">Related: {message.sources.map((source) => source.title).join(" · ")}</div> : null}</div>)}
            {chatBusy && <div className="flex w-fit items-center gap-2 rounded-xl border dashboard-border p-3 text-xs dashboard-muted"><Loader2 size={14} className="animate-spin" /> Checking support documentation…</div>}
          </div>
          <div className="border-t dashboard-border p-3"><button onClick={() => setTicketOpen(true)} className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300"><Ticket size={13} /> Raise a support ticket</button><form onSubmit={send} className="flex gap-2"><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Ask a question or describe an issue…" className="min-h-12 flex-1 resize-none rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500" /><button disabled={!chatInput.trim() || chatBusy} className="grid h-12 w-12 place-items-center self-end rounded-xl bg-blue-600 text-white disabled:opacity-40"><Send size={17} /></button></form></div>
        </section>
      </section>

      {ticketOpen && <div className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"><form onSubmit={raiseTicket} className="dashboard-card w-full max-w-xl rounded-2xl p-5 shadow-2xl sm:p-6"><div className="flex items-start"><div className="flex-1"><p className="text-xs font-semibold text-blue-500">Support ticket</p><h2 className="mt-1 text-xl font-semibold">Report an issue</h2><p className="mt-1 text-xs dashboard-muted">The ticket will be linked to {currentWebsite?.name || "your workspace"}.</p></div><button type="button" onClick={() => setTicketOpen(false)} className="rounded-lg p-2 dashboard-hover"><X size={17} /></button></div>{ticketResult && <p className="mt-4 flex items-start gap-2 rounded-xl border dashboard-border bg-emerald-500/[.07] p-3 text-xs leading-5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />{ticketResult}</p>}<div className="mt-5 space-y-4"><SupportField label="Subject" value={ticket.subject} onChange={(value) => setTicket({ ...ticket, subject: value })} /><div className="grid grid-cols-2 gap-3"><label className="text-xs dashboard-muted">Category<select value={ticket.category} onChange={(event) => setTicket({ ...ticket, category: event.target.value })} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent p-3 text-sm"><option>Technical issue</option><option>Website publishing</option><option>Billing</option><option>Account</option><option>Feature request</option></select></label><label className="text-xs dashboard-muted">Priority<select value={ticket.priority} onChange={(event) => setTicket({ ...ticket, priority: event.target.value })} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent p-3 text-sm"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div><label className="block text-xs dashboard-muted">What happened?<textarea value={ticket.details} onChange={(event) => setTicket({ ...ticket, details: event.target.value })} className="mt-1.5 min-h-32 w-full resize-y rounded-xl border dashboard-border bg-transparent p-3 text-sm leading-6 outline-none focus:border-blue-500" /></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setTicketOpen(false)} className="rounded-xl border dashboard-border px-4 py-2.5 text-xs font-semibold dashboard-hover">Close</button><button disabled={ticketBusy || !ticket.subject.trim() || !ticket.details.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-45">{ticketBusy ? <Loader2 size={14} className="animate-spin" /> : <Ticket size={14} />} Create ticket</button></div></form></div>}
    </div>
  );
}

function SupportField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs dashboard-muted">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent p-3 text-sm outline-none focus:border-blue-500" /></label>;
}
