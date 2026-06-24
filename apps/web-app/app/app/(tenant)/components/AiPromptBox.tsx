"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Mail,
  Mic,
  Sparkles,
  LayoutDashboard,
  FileText,
  CreditCard,
} from "lucide-react";

const PROMPTS = [
  "Generate a multi-page website for a SaaS with pricing, docs, and blog…",
  "Create a startup landing page with hero, social proof, and FAQ…",
  "Design a dashboard-style admin UI with a dark glass theme…",
];

const CHIP_PROMPTS: Record<string, string> = {
  saas:
    "Create a modern SaaS website with pricing, feature comparison, documentation, and blog",
  admin:
    "Design a dashboard-style admin UI with analytics, roles, and a dark glass UI",
  docs:
    "Build a self-hosted documentation website with search, versioning, and markdown support",
  pricing:
    "Create a conversion-focused website with pricing tables, FAQ, and testimonials",
};

export default function AiPromptBox() {
  const [mode, setMode] = useState<"Web" | "Email">("Web");
  const [value, setValue] = useState("");
  const [typed, setTyped] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const activePrompt = useMemo(() => PROMPTS[promptIndex], [promptIndex]);

  /* ---------- looping typewriter placeholder ---------- */
  useEffect(() => {
    if (focused || value) return;

    let i = 0;
    let cancelled = false;
    setTyped("");

    const tick = () => {
      if (cancelled) return;
      i++;
      setTyped(activePrompt.slice(0, i));

      if (i < activePrompt.length) {
        setTimeout(tick, 22);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setPromptIndex((p) => (p + 1) % PROMPTS.length);
          }
        }, 1400);
      }
    };

    const t = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [activePrompt, focused, value]);

  return (
    <div className="glass-strong relative rounded-[28px] p-6 border border-white/15 shadow-xl shadow-black/40">
      {/* soft inner shine */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-r from-white/15 to-white/0 opacity-40" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-violet-300 drop-shadow-[0_0_14px_rgba(139,92,246,0.8)]">
            <Sparkles className="h-4 w-4" />
            AI Website Generator
          </div>
        </div>

        {/* Prompt Box */}
        <div
          className={`relative rounded-xl border px-5 py-4 transition backdrop-blur-md
            ${
              focused
                ? "border-violet-400/60 bg-white/[0.08]"
                : "border-white/15 bg-white/[0.04]"
            }`}
          onClick={() => setFocused(true)}
        >
          {!focused && !value && (
            <div className="absolute inset-0 px-5 py-4 text-white/40 pointer-events-none">
              {typed}
              <span className="inline-block ml-1 animate-pulse">|</span>
            </div>
          )}

          <textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={focused ? "Describe your website idea…" : ""}
            className="w-full resize-none bg-transparent outline-none text-white text-base"
          />
        </div>

        {/* Action Row */}
        <div className="mt-4 flex items-center gap-3">
          <button
            className="glass rounded-full h-10 w-10 flex items-center justify-center hover:brightness-110 transition"
            type="button"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4 text-white/80" />
          </button>

          <button
            className="ml-auto h-10 px-6 rounded-full font-medium shadow-lg shadow-black/40 hover:scale-105 transition"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--be-primary)), rgb(var(--be-secondary)))",
            }}
            type="button"
          >
            Generate →
          </button>
        </div>

        {/* Mode + Chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setMode("Web")}
            className={`rounded-full px-3 py-1 flex items-center gap-1.5 transition ${
              mode === "Web" ? "glass-strong" : "glass"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Web
          </button>

          <button
            onClick={() => setMode("Email")}
            className={`rounded-full px-3 py-1 flex items-center gap-1.5 transition ${
              mode === "Email" ? "glass-strong" : "glass"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>

          <span className="ml-2 text-white/60">
            Mode: <span className="text-white/80">{mode}</span>
          </span>

          <div className="w-full mt-3 flex flex-wrap gap-2">
            <button
              className="glass rounded-full px-3 py-1 flex items-center gap-1.5"
              onClick={() => {
                setValue(CHIP_PROMPTS.saas);
                setFocused(true);
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
              SaaS website
            </button>

            <button
              className="glass rounded-full px-3 py-1 flex items-center gap-1.5"
              onClick={() => {
                setValue(CHIP_PROMPTS.admin);
                setFocused(true);
              }}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin dashboard
            </button>

            <button
              className="glass rounded-full px-3 py-1 flex items-center gap-1.5"
              onClick={() => {
                setValue(CHIP_PROMPTS.docs);
                setFocused(true);
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Self-hosted docs
            </button>

            <button
              className="glass rounded-full px-3 py-1 flex items-center gap-1.5"
              onClick={() => {
                setValue(CHIP_PROMPTS.pricing);
                setFocused(true);
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Pricing + FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
