"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Sparkles,
  Square,
} from "lucide-react";

import { useAiRuntime } from "../hooks/useAiRuntime";
import { useAiStore, type AiAgentActivity } from "../store/useAiStore";

interface AiPanelProps {
  pageId: string;
  onRunAI: (prompt: string) => Promise<void> | void;
  onAbortAI: () => void;
  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };
  onRequestLogoUpload(): void;
  onRefine?: (request: string, targetSection?: string) => void;
  hasGeneratedCode?: boolean;
}

const TONES = ["Professional", "Premium", "Friendly", "Bold"];

const SUGGESTIONS = [
  "Review this page and fix weak copy",
  "Show 3 stronger homepage directions",
  "Make the hero feel premium",
];

const RUNNING_THOUGHTS = [
  {
    title: "Strategy",
    body: "Reading the brief, audience, business goal, and page context.",
  },
  {
    title: "Layout",
    body: "Choosing sections, hierarchy, conversion path, and editable structure.",
  },
  {
    title: "Design",
    body: "Setting visual direction, spacing, typography, and interaction polish.",
  },
  {
    title: "Content",
    body: "Writing page-ready copy with clear CTAs and no placeholder language.",
  },
  {
    title: "Assets",
    body: "Selecting practical image guidance and brand asset usage.",
  },
  {
    title: "QA",
    body: "Checking responsiveness, missing content, accessibility, and quality.",
  },
];

const AGENT_LABELS: Record<string, string> = {
  IntentAgent: "Strategy",
  SitePlannerAgent: "Layout",
  DesignDirectionAgent: "Design",
  ContentAgent: "Copy",
  SectionRecipeAgent: "Sections",
  AssetAgent: "Assets",
  BlueprintAgent: "Build",
  ValidatorAgent: "Validation",
  QAAgent: "QA",
  RepairAgent: "Polish",
};

interface ThoughtLine {
  title: string;
  body: string;
  warnings?: string[];
}

function agentLabel(agent: string) {
  return AGENT_LABELS[agent] || agent.replace(/Agent$/, "");
}

function formatAgent(agent: AiAgentActivity): ThoughtLine {
  const warnings = agent.warnings?.filter(Boolean) || [];
  return {
    title: agentLabel(agent.agent),
    body:
      agent.summary ||
      (agent.ok ? "Completed this step." : "Needs one more quality pass."),
    warnings,
  };
}

function buildRunningThoughts(elapsed: number): ThoughtLine[] {
  const activeIndex = Math.min(
    RUNNING_THOUGHTS.length - 1,
    Math.max(0, Math.floor(elapsed / 4))
  );

  return RUNNING_THOUGHTS.slice(0, activeIndex + 1);
}

export default function AiPanel({
  onRunAI,
  onAbortAI,
  aiChatRuntime,
  onRequestLogoUpload,
  onRefine,
  hasGeneratedCode = false,
}: AiPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { elapsed } = useAiRuntime();
  const agents = useAiStore((s) => s.agents);

  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const [mode, setMode] = useState<"generate" | "refine">(
    hasGeneratedCode ? "refine" : "generate"
  );

  const isRunning = aiChatRuntime.status === "running";
  const isError = aiChatRuntime.status === "error";

  const visibleThoughts = useMemo(() => {
    if (isRunning) return buildRunningThoughts(elapsed);
    return agents.map(formatAgent);
  }, [agents, elapsed, isRunning]);
  const activeThought = visibleThoughts[visibleThoughts.length - 1];

  async function submitPrompt(nextPrompt = prompt) {
    const cleanPrompt = nextPrompt.trim();
    if (!cleanPrompt || isRunning) return;

    setPrompt("");
    setLastUserPrompt(cleanPrompt);

    if (mode === "refine" && hasGeneratedCode && onRefine) {
      onRefine(`${cleanPrompt}\n\nTone: ${tone}`);
      return;
    }

    await onRunAI(`${cleanPrompt}

Tone: ${tone}

No-code output:
- Keep responses in plain language for a no-code user
- Generate polished, editable website sections
- Coordinate strategy, layout, design, copy, assets, validation, and QA agents
- Offer options when multiple strong directions are possible`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a0c10] text-white">
      <style>{`
        @keyframes buildez-ai-scan {
          0% { transform: translateX(-120%); opacity: 0; }
          18% { opacity: 0.75; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes buildez-ai-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes buildez-ai-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .buildez-ai-scan::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.16), transparent);
          animation: buildez-ai-scan 2.4s ease-in-out infinite;
        }

        .buildez-ai-orbit {
          animation: buildez-ai-orbit 3.8s linear infinite;
        }

        .buildez-ai-dot {
          animation: buildez-ai-dot 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="border-b border-neutral-800/80 bg-[#0d1016]/95 px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-200">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>BuildEZ Copilot</span>
            </div>
            <p className="mt-1 truncate text-xs text-neutral-500">
              Website generation, review, and polish
            </p>
          </div>

          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            OpenAI
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div
          className={`relative max-w-[92%] overflow-hidden rounded-[22px] border border-neutral-800 bg-neutral-900/70 px-4 py-3 shadow-xl shadow-black/20 ${
            isRunning ? "buildez-ai-scan" : ""
          }`}
        >
          <p className="text-sm leading-6 text-neutral-200">
            Tell me what to build or improve. I will work through strategy,
            layout, design, copy, assets, and QA, then place the result on the
            canvas.
          </p>
        </div>

        {lastUserPrompt ? (
          <div className="ml-auto max-w-[88%] rounded-[22px] bg-neutral-800 px-4 py-3 shadow-xl shadow-black/20">
            <p className="text-sm leading-6 text-neutral-100">{lastUserPrompt}</p>
          </div>
        ) : null}

        {isRunning ? (
          <div className="relative overflow-hidden rounded-[22px] border border-sky-500/20 bg-sky-500/[0.07] px-4 py-3 shadow-[0_0_34px_rgba(14,165,233,0.12)]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-sky-400/15 buildez-ai-orbit" />
            <div className="relative flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-100">
                  Working
                  <span className="buildez-ai-dot">.</span>
                  <span className="buildez-ai-dot [animation-delay:120ms]">.</span>
                  <span className="buildez-ai-dot [animation-delay:240ms]">.</span>
                  <span className="ml-1 text-neutral-500">{elapsed}s</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  {activeThought
                    ? `${activeThought.title}: ${activeThought.body}`
                    : "Coordinating the generation agents."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {visibleThoughts.length ? (
          <div className="max-w-[94%] rounded-[22px] border border-neutral-800 bg-[#111419]/95 px-4 py-3 shadow-xl shadow-black/25">
            <div className="space-y-3">
              {visibleThoughts.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="grid grid-cols-[68px_minmax(0,1fr)] gap-3"
                >
                  <div className="flex items-center gap-2">
                    {isRunning && index === visibleThoughts.length - 1 ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                    )}
                    <p
                      className={`text-xs font-semibold ${
                        isRunning && index === visibleThoughts.length - 1
                          ? "text-sky-200"
                          : "text-neutral-500"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-6 text-neutral-200">
                      {item.body}
                    </p>
                    {"warnings" in item && item.warnings.length ? (
                      <p className="mt-1 text-xs leading-5 text-amber-200/80">
                        {item.warnings.join(" ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!isRunning && aiChatRuntime.status === "success" ? (
          <div className="max-w-[92%] rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm leading-6 text-emerald-100">
              Done. I generated the page and completed the quality pass.
            </p>
          </div>
        ) : null}

        {isError ? (
          <div className="max-w-[92%] rounded-[22px] border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-sm leading-6 text-red-100">
              {aiChatRuntime.message || "AI request failed."}
            </p>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-neutral-800/80 bg-[#0d1016]/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-2xl">
        {!lastUserPrompt && !isRunning ? (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setPrompt(item);
                  inputRef.current?.focus();
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-sky-500/40 hover:text-neutral-100"
              >
                {item}
                <Plus className="h-3 w-3" />
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={`rounded-[22px] border border-neutral-800 bg-neutral-900/90 p-2 shadow-2xl shadow-black/30 ${
            isRunning ? "shadow-sky-950/20" : ""
          }`}
        >
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
              }
            }}
            rows={3}
            disabled={isRunning}
            placeholder="Add follow up..."
            className="min-h-[68px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-600 disabled:opacity-60"
          />

          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === "generate" ? "refine" : "generate")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
              >
                {mode === "generate" ? "Generate" : "Refine"}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="rounded-lg bg-transparent px-1.5 py-1.5 text-xs text-neutral-500 outline-none transition hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Tone"
              >
                {TONES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRequestLogoUpload}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Use brand assets"
              >
                <ImageIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={isRunning ? onAbortAI : () => submitPrompt()}
                disabled={!isRunning && !prompt.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${
                  isRunning
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-sky-500 text-white hover:bg-sky-400"
                }`}
                aria-label={isRunning ? "Stop AI" : "Send prompt"}
              >
                {isRunning ? (
                  <Square className="h-4 w-4" fill="currentColor" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
