"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";

import type { AIChannelConfig } from "./config";

type ChatMessage = { role: "assistant" | "user"; text: string };

export function SiteChatWidgets({ siteId }: { siteId: string }) {
  const [channels, setChannels] = useState<AIChannelConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetch(`/api/public/ai-chat/${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload) return;
        setChannels(payload);
        if (payload.websiteChatbot) {
          setMessages([{ role: "assistant", text: payload.websiteChatbot.welcomeMessage }]);
        }
      })
      .catch(() => undefined);
  }, [siteId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text: message }]);
    setBusy(true);
    try {
      const response = await fetch(`/api/public/ai-chat/${encodeURIComponent(siteId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json();
      setMessages((current) => [...current, {
        role: "assistant",
        text: response.ok ? payload.answer : "I’m sorry, chat is temporarily unavailable.",
      }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "I’m sorry, chat is temporarily unavailable." }]);
    } finally {
      setBusy(false);
    }
  }

  if (!channels?.websiteChatbot && !channels?.whatsapp) return null;
  const chatbot = channels.websiteChatbot;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3 font-sans">
      {open && chatbot && (
        <section className="flex h-[min(520px,72vh)] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl">
          <header className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: chatbot.accentColor }}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><MessageCircle size={18} /></span>
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{chatbot.name}</strong><span className="text-[11px] text-white/70">AI assistant · online</span></div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 hover:bg-white/10"><X size={17} /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.role === "user" ? "ml-auto bg-slate-900 text-white" : "border border-slate-200 bg-white"}`}>{message.text}</div>
            ))}
            {busy && <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"><Loader2 size={13} className="animate-spin" /> Thinking…</div>}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            <button aria-label="Send message" disabled={!input.trim() || busy} className="grid h-10 w-10 place-items-center rounded-xl text-white disabled:opacity-40" style={{ backgroundColor: chatbot.accentColor }}><Send size={16} /></button>
          </form>
        </section>
      )}
      <div className="flex items-center gap-2">
        {channels.whatsapp && (
          <a href={`https://wa.me/${channels.whatsapp.phoneNumber}?text=${encodeURIComponent(channels.whatsapp.defaultMessage)}`} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white shadow-xl"><MessageCircle size={19} /> WhatsApp</a>
        )}
        {chatbot && (
          <button onClick={() => setOpen((value) => !value)} aria-label="Open website assistant" className="grid h-14 w-14 place-items-center rounded-full text-white shadow-xl" style={{ backgroundColor: chatbot.accentColor }}>{open ? <X size={22} /> : <MessageCircle size={23} />}</button>
        )}
      </div>
    </div>
  );
}
