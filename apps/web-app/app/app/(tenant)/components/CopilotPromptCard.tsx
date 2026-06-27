"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  Mic,
  Sparkles,
  Wand2,
} from "lucide-react";

const PLACEHOLDERS = [
  "a premium real-estate website with enquiry forms, location proof, and property cards...",
  "a polished SaaS homepage with pricing, social proof, and demo booking...",
  "a modern clinic website with services, doctor profiles, and appointment CTAs...",
  "a conversion-focused restaurant site with menu highlights and reservations...",
];

const AGENTS = [
  "Strategy",
  "Layout",
  "Design",
  "Copy",
  "Assets",
  "QA",
];

const SUGGESTIONS = [
  "Show 3 website directions",
  "Use my brand style",
  "Make it premium",
  "Focus on lead generation",
];

interface CopilotPromptCardProps {
  contextLabel?: string;
  subtitle?: string;
}

export default function CopilotPromptCard({
  contextLabel = "Web",
  subtitle = "Describe the outcome. BuildEZ coordinates agents for strategy, layout, copy, visuals, and QA.",
}: CopilotPromptCardProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("Balanced");

  const placeholder = useMemo(
    () => PLACEHOLDERS[loopIndex],
    [loopIndex]
  );

  useEffect(() => {
    if (focused || value) return;

    let i = 0;
    let cancelled = false;
    setTyped("");

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTyped(placeholder.slice(0, i));

      if (i < placeholder.length) {
        setTimeout(tick, 24);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setLoopIndex((next) => (next + 1) % PLACEHOLDERS.length);
          }
        }, 1300);
      }
    };

    const timer = setTimeout(tick, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [focused, placeholder, value]);

  return (
    <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-[28px] border border-neutral-800/80 bg-neutral-950/75 shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.82),transparent_46%)]" />

      <div className="relative grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-sky-500/25 bg-sky-500/10 shadow-lg shadow-black/20">
                <Sparkles className="h-4 w-4 text-sky-200" />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold">BuildEZ Copilot</p>
                <p className="text-xs dashboard-muted">{subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs dashboard-muted"
            >
              OpenAI
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative rounded-3xl border border-neutral-800 bg-black/20 p-3 text-left backdrop-blur-xl">
            {!focused && !value && (
              <div className="pointer-events-none absolute left-5 right-5 top-5 text-sm dashboard-muted">
                {typed}
                <span className="ml-1 animate-pulse">|</span>
              </div>
            )}

            <textarea
              ref={inputRef}
              rows={4}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="min-h-[118px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
              aria-label="Describe your website"
            />

            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-800 px-1 pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs">
                <Globe className="h-3.5 w-3.5" />
                {contextLabel}
              </span>

              {["Balanced", "Premium", "Fast lead-gen"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selectedOption === option
                      ? "border-sky-500/45 bg-sky-500/10 text-sky-100"
                      : "border-neutral-800 bg-neutral-900/60 dashboard-muted hover:border-neutral-700 hover:text-current"
                  }`}
                >
                  {option}
                </button>
              ))}

              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400"
                aria-label="Generate with AI"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setValue(suggestion);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1.5 text-xs dashboard-muted backdrop-blur-xl transition hover:border-neutral-700 hover:text-current"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <aside className="border-t border-neutral-800 bg-black/20 p-4 text-left backdrop-blur-2xl lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-wide dashboard-muted">
            Agents ready
          </p>

          <div className="mt-3 space-y-2">
            {AGENTS.map((agent, index) => (
              <div
                key={agent}
                className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/55 px-3 py-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
                  {index < 2 ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className="text-xs">{agent}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 text-left"
            >
              <LayoutTemplate className="h-4 w-4 text-sky-200" />
              <p className="mt-2 text-xs">Options</p>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 text-left"
            >
              <ImageIcon className="h-4 w-4 text-violet-200" />
              <p className="mt-2 text-xs">Assets</p>
            </button>
          </div>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs dashboard-muted"
          >
            <Mic className="h-3.5 w-3.5" />
            Voice prompt
          </button>
        </aside>
      </div>
    </div>
  );
}
