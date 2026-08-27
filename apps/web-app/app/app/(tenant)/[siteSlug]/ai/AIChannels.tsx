"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Bot, Check, Loader2, MessageCircle, RefreshCw, Save, Sparkles } from "lucide-react";

import type { AIChannelConfig } from "@/modules/ai-channels/config";

export function AIChannels({ siteId }: { siteId: string }) {
  const [channels, setChannels] = useState<AIChannelConfig>();
  const [busy, setBusy] = useState<"load" | "generate" | "save" | null>("load");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/ai-channels`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Channels could not be loaded");
    setChannels(payload.channels);
  }, [siteId]);

  useEffect(() => {
    setBusy("load");
    load().catch((error) => setMessage(error.message)).finally(() => setBusy(null));
  }, [load]);

  async function generate() {
    setBusy("generate");
    setMessage("");
    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/ai-channels`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Setup could not be generated");
      setChannels(payload.channels);
      setMessage("AI created a channel setup from your website. Review it, then deploy.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Setup could not be generated");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!channels) return;
    setBusy("save");
    setMessage("");
    try {
      const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/ai-channels`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channels }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Channels could not be saved");
      setChannels(payload.channels);
      setMessage("Your AI channels are saved and deployment is up to date.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Channels could not be saved");
    } finally {
      setBusy(null);
    }
  }

  const updateWebsite = (patch: Partial<AIChannelConfig["websiteChatbot"]>) =>
    setChannels((current) => current ? { ...current, websiteChatbot: { ...current.websiteChatbot, ...patch } } : current);
  const updateWhatsApp = (patch: Partial<AIChannelConfig["whatsapp"]>) =>
    setChannels((current) => current ? { ...current, whatsapp: { ...current.whatsapp, ...patch } } : current);

  if (!channels) {
    return <section className="mt-8 grid min-h-48 place-items-center rounded-2xl border dashboard-border"><Loader2 className="animate-spin text-blue-500" /></section>;
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AI customer channels</h2>
          <p className="mt-1 text-xs dashboard-muted">Generate, customize and deploy assistants grounded in this website.</p>
        </div>
        <button onClick={() => void generate()} disabled={busy === "generate"} className="flex items-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-xs font-semibold dashboard-hover disabled:opacity-50">
          {busy === "generate" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate intelligent setup
        </button>
      </div>
      {message && <p className="mt-3 rounded-xl border dashboard-border bg-blue-500/[.06] px-4 py-3 text-xs dashboard-muted">{message}</p>}
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <ChannelCard icon={Bot} title="Website AI chatbot" status={channels.websiteChatbot.enabled ? "Deployed" : "Draft"}>
          <Field label="Assistant name" value={channels.websiteChatbot.name} onChange={(value) => updateWebsite({ name: value })} />
          <TextArea label="Welcome message" value={channels.websiteChatbot.welcomeMessage} onChange={(value) => updateWebsite({ welcomeMessage: value })} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs dashboard-muted">Tone<select value={channels.websiteChatbot.tone} onChange={(event) => updateWebsite({ tone: event.target.value as AIChannelConfig["websiteChatbot"]["tone"] })} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm"><option value="helpful">Helpful</option><option value="friendly">Friendly</option><option value="professional">Professional</option></select></label>
            <label className="text-xs dashboard-muted">Accent color<input type="color" value={channels.websiteChatbot.accentColor} onChange={(event) => updateWebsite({ accentColor: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border dashboard-border bg-transparent p-1" /></label>
          </div>
          <Toggle checked={channels.websiteChatbot.enabled} onChange={(enabled) => updateWebsite({ enabled })} label="Deploy on published website" />
        </ChannelCard>
        <ChannelCard icon={MessageCircle} title="WhatsApp AI agent" status={channels.whatsapp.enabled ? "Deployed" : "Draft"}>
          <Field label="WhatsApp number (country code included)" value={channels.whatsapp.phoneNumber} placeholder="919876543210" onChange={(value) => updateWhatsApp({ phoneNumber: value.replace(/\D/g, "") })} />
          <Field label="Button label" value={channels.whatsapp.welcomeMessage} onChange={(value) => updateWhatsApp({ welcomeMessage: value })} />
          <TextArea label="Pre-filled first message" value={channels.whatsapp.defaultMessage} onChange={(value) => updateWhatsApp({ defaultMessage: value })} />
          <Toggle checked={channels.whatsapp.enabled} onChange={(enabled) => updateWhatsApp({ enabled })} label="Deploy WhatsApp assistant" />
        </ChannelCard>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => void save()} disabled={busy === "save"} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-45">
          {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save and deploy
        </button>
      </div>
    </section>
  );
}

function ChannelCard({ icon: Icon, title, status, children }: { icon: typeof Bot; title: string; status: string; children: ReactNode }) {
  return <article className="dashboard-card rounded-2xl p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500"><Icon size={18} /></span><h3 className="font-semibold">{title}</h3><span className={`ml-auto rounded-full px-2 py-1 text-[9px] font-bold uppercase ${status === "Deployed" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 dashboard-muted"}`}>{status}</span></div><div className="mt-5 space-y-4">{children}</div></article>;
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return <label className="block text-xs dashboard-muted">{label}<input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs dashboard-muted">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-20 w-full resize-y rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-sm leading-5 outline-none focus:border-blue-500" /></label>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <label className="flex cursor-pointer items-center justify-between rounded-xl border dashboard-border px-3.5 py-3 text-xs font-medium"><span className="flex items-center gap-2">{checked ? <Check size={14} className="text-emerald-500" /> : <RefreshCw size={14} className="dashboard-faint" />}{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-blue-600" /></label>;
}
