"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Check, Copy, Loader2, Sparkles, Wand2, X } from "lucide-react";

import type { CreativeDirection } from "@/modules/ai-v12/creativeDirection";
import type { V12AgentContext } from "./V12AgentPanel";

type PillOption = { id: string; label: string; hint: string };

type PillQuestion = {
  id: string;
  question: string;
  multiSelect?: boolean;
  options: PillOption[];
};

const QUESTIONS: PillQuestion[] = [
  {
    id: "goal",
    question: "What do you want to do?",
    options: [
      { id: "fix", label: "Fix an issue", hint: "fix a specific problem" },
      { id: "design", label: "Improve design", hint: "improve the visual design" },
      { id: "feature", label: "Add a feature", hint: "add a new feature" },
      { id: "content", label: "Rewrite content", hint: "rewrite the copy/content" },
      { id: "page", label: "Generate a new page", hint: "generate a brand-new page" },
    ],
  },
  {
    id: "scope",
    question: "Where should this apply?",
    options: [
      { id: "site", label: "Whole website", hint: "apply across the whole website" },
      { id: "page", label: "This page", hint: "apply only to this page" },
      { id: "section", label: "A specific section", hint: "apply only to the relevant section" },
      { id: "text", label: "Just the text/copy", hint: "text/copy only, don't touch layout" },
    ],
  },
  {
    id: "style",
    question: "Any style or tone to follow?",
    multiSelect: true,
    options: [
      { id: "professional", label: "Professional", hint: "professional tone" },
      { id: "playful", label: "Playful", hint: "playful tone" },
      { id: "minimal", label: "Minimal", hint: "minimal, uncluttered" },
      { id: "bold", label: "Bold", hint: "bold, high-impact" },
      { id: "brand", label: "Match existing brand", hint: "stay consistent with the existing brand" },
    ],
  },
  {
    id: "experience",
    question: "What kind of experience?",
    options: [
      { id: "traditional", label: "Traditional modern", hint: "a traditional modern experience" },
      { id: "immersive", label: "Immersive 3D / cinematic", hint: "an immersive 3D / cinematic experience" },
    ],
  },
  {
    id: "imagery",
    question: "Imagery style?",
    options: [
      { id: "photorealistic", label: "Photorealistic", hint: "photorealistic imagery" },
      { id: "illustration", label: "Editorial illustration", hint: "editorial illustration imagery" },
      { id: "3d", label: "3D", hint: "3D-rendered imagery" },
      { id: "abstract", label: "Abstract", hint: "abstract imagery" },
      { id: "collage", label: "Collage", hint: "collage-style imagery" },
      { id: "none", label: "No generated imagery", hint: "no generated imagery" },
    ],
  },
];

function collectHints(selections: Record<string, string[]>) {
  return QUESTIONS.flatMap((question) =>
    question.options.filter((option) => selections[question.id]?.includes(option.id)).map((option) => option.hint),
  );
}

function buildFallbackPrompt(selections: Record<string, string[]>, details: string) {
  const hints = collectHints(selections);
  const parts: string[] = [];

  if (details.trim()) {
    parts.push(details.trim());
    if (hints.length) parts.push(`(${hints.join(", ")})`);
  } else if (hints.length) {
    parts.push(hints.map((hint, index) => (index === 0 ? hint.charAt(0).toUpperCase() + hint.slice(1) : hint)).join(", "));
  }

  const text = parts.join(" ").trim();
  return text ? (text.endsWith(".") ? text : `${text}.`) : "";
}

export function PromptGeneratorModal({
  siteId,
  context,
  selectedElementLabel,
  creativeDirection,
  initialPrompt,
  onInsert,
  onClose,
}: {
  siteId: string;
  context: V12AgentContext;
  selectedElementLabel?: string;
  creativeDirection?: CreativeDirection;
  initialPrompt: string;
  onInsert(prompt: string): void;
  onClose(): void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [details, setDetails] = useState(initialPrompt);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const fallbackPreview = useMemo(() => buildFallbackPrompt(selections, details), [selections, details]);
  const hasInput = Boolean(details.trim() || Object.values(selections).some((ids) => ids.length));
  const shown = generated || fallbackPreview;

  function toggleOption(question: PillQuestion, optionId: string) {
    setSelections((current) => {
      const existing = current[question.id] || [];
      if (question.multiSelect) {
        return {
          ...current,
          [question.id]: existing.includes(optionId) ? existing.filter((id) => id !== optionId) : [...existing, optionId],
        };
      }
      return { ...current, [question.id]: existing[0] === optionId ? [] : [optionId] };
    });
  }

  async function generateWithAi() {
    if (!hasInput || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/builder-v3/agent/prompt-generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteId,
          idea: details,
          context,
          selectedElementLabel,
          hints: collectHints(selections),
          creativeDirection,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.prompt !== "string") {
        throw new Error(payload?.error || "Could not generate a prompt.");
      }
      setGenerated(payload.prompt);
      setStatus("idle");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate a prompt.");
      setStatus("error");
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(shown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access can fail silently (permissions); no further action needed
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[40000] grid place-items-center bg-black/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#15171c]/80 text-white shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/15 text-blue-300">
              <Wand2 size={16} />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Prompt generator</h2>
              <p className="text-[11px] text-white/40">Turn a rough idea into a precise prompt, AI-crafted for you</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <p className="text-xs font-semibold text-white/70">What's your idea?</p>
            <textarea
              value={details}
              onChange={(event) => {
                setDetails(event.target.value);
                if (generated) setGenerated("");
                if (status === "error") setStatus("idle");
              }}
              placeholder="e.g. the hero feels flat, make it stand out and add a way for people to book a call"
              className="mt-2 h-20 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {QUESTIONS.map((question) => (
            <div key={question.id}>
              <p className="text-xs font-semibold text-white/70">{question.question}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {question.options.map((option) => {
                  const active = (selections[question.id] || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        toggleOption(question, option.id);
                        if (generated) setGenerated("");
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? "border-blue-400/50 bg-blue-500/20 text-blue-200"
                          : "border-white/10 text-white/55 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={() => void generateWithAi()}
            disabled={!hasInput || status === "loading"}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {status === "loading" ? "Writing your prompt…" : generated ? "Rewrite with AI" : "Craft this into a great prompt"}
          </button>

          {status === "error" && (
            <div className="flex items-start gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{error} You can still edit and use the draft below.</span>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                <Sparkles size={11} /> {generated ? "AI-crafted prompt" : "Prompt preview"}
              </div>
              {generated && <span className="text-[10px] text-white/30">Editable</span>}
            </div>
            <textarea
              value={shown}
              onChange={(event) => setGenerated(event.target.value)}
              placeholder="Describe your idea above, or add a few quick picks, to build a prompt."
              className="mt-2 h-24 w-full resize-none bg-transparent text-sm leading-6 text-white/85 outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/10 p-4">
          <button
            onClick={() => void copyPrompt()}
            disabled={!shown.trim()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onInsert(shown)}
            disabled={!shown.trim()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wand2 size={14} /> Insert into chat
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
