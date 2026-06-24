"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Square,
  Loader2,
  Bot,
  User,
  Paperclip,
} from "lucide-react";

import { AIAttachmentMenu } from "@/app/app/components/ai/AIAttachmentMenu";

/* ============================================================
   TYPES
============================================================ */

type Role = "user" | "assistant";
type AIStage = "collecting" | "ready" | "running";

interface AiMessage {
  role: Role;
  text: string;
  ts: number;
  kind?: "text" | "pills";
}

interface AIRefinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
  density?: "minimal" | "balanced" | "detailed";
  cta?: "soft" | "standard" | "aggressive";
}

interface AiPanelProps {
  pageId: string;
  page: any;
  onRunAI: (
    prompt: string,
    context?: any,
    refinements?: AIRefinements
  ) => Promise<void>;
  onAbortAI: () => void;
}

/* ============================================================
   HELPERS
============================================================ */

const now = () => Date.now();
const STORAGE_KEY = (pageId: string) => `buildez-ai-chat:${pageId}`;

function runtimeLabel(state?: AIRuntimeState) {
  if (!state?.active) return null;

  return (
    state.stepLabel ??
    {
      starting: "Starting AI…",
      understanding: "Understanding request…",
      planning: "Planning layout…",
      generating: "Generating content…",
      applying: "Applying changes…",
      finalizing: "Finalizing…",
    }[state.step] ??
    "AI working…"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function AiPanel({
  pageId,
  onRunAI,
  onAbortAI,
}: AiPanelProps) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [runtime, setRuntime] = useState<AIRuntimeState | null>(null);
  const [refinements, setRefinements] = useState<AIRefinements>({});
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [stage, setStage] = useState<AIStage>("collecting");

  const bottomRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const [, forceTick] = useState(0);

  /* ============================================================
     RESTORE CHAT
  ============================================================ */

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY(pageId));

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setStage("ready");
          return;
        }
      } catch {}
    }

    setMessages([
      {
        role: "assistant",
        text:
          "Describe the website you want. I’ll design the layout and generate the content for you.",
        ts: now(),
      },
    ]);
  }, [pageId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(pageId), JSON.stringify(messages));
  }, [messages, pageId]);

  /* ============================================================
     RUNTIME + TIMER
  ============================================================ */

  useEffect(() => subscribeAIRuntime(setRuntime), []);

  useEffect(() => {
    if (runtime?.active && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      setStage("running");
    }

    if (!runtime?.active) {
      startTimeRef.current = null;
    }
  }, [runtime?.active]);

  useEffect(() => {
    if (!runtime?.active) return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [runtime?.active]);

  const elapsed =
    runtime?.active && startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : null;

  /* ============================================================
     AUTOSCROLL
  ============================================================ */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, runtime]);

  /* ============================================================
     EXECUTE AI (FIXED)
  ============================================================ */

  async function handleRun() {
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput("");

    setMessages((m) => [
      ...m,
      { role: "user", text: prompt, ts: now() },
    ]);

    // FIRST STAGE → show refinement pills, do NOT run AI
    if (stage === "collecting") {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Great. Before I generate the layout, refine the style if needed.",
          ts: now(),
        },
        { role: "assistant", text: "", ts: now(), kind: "pills" },
      ]);
      setStage("ready");
      return;
    }

    // SECOND STAGE → actually run AI
    await onRunAI(prompt, {}, refinements);
  }

  function handleAbort() {
    onAbortAI();
    resetAIRuntime();
    setStage("ready");
  }

  /* ============================================================
     UI HELPERS
  ============================================================ */

  function Pill({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick(): void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs border ${
          active
            ? "bg-blue-600 border-blue-500 text-white"
            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
        }`}
      >
        {label}
      </button>
    );
  }

  /* ============================================================
     RENDER (UNCHANGED UI)
  ============================================================ */

  return (
    <div className="h-full flex flex-col px-2 py-2 text-white/90">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${
              m.role === "assistant"
                ? "justify-start"
                : "justify-end"
            }`}
          >
            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
              {m.role === "assistant" ? (
                <Bot size={14} />
              ) : (
                <User size={14} />
              )}
            </div>

            {m.kind === "pills" ? (
              <div className="flex flex-wrap gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3">
                <Pill label="Professional" active={refinements.tone==="professional"} onClick={() => setRefinements(r=>({...r,tone:"professional"}))}/>
                <Pill label="Friendly" active={refinements.tone==="friendly"} onClick={() => setRefinements(r=>({...r,tone:"friendly"}))}/>
                <Pill label="Premium" active={refinements.tone==="premium"} onClick={() => setRefinements(r=>({...r,tone:"premium"}))}/>
                <Pill label="Bold" active={refinements.tone==="bold"} onClick={() => setRefinements(r=>({...r,tone:"bold"}))}/>
              </div>
            ) : (
              <div
                className={`max-w-[75%] px-4 py-3 text-sm rounded-2xl border ${
                  m.role === "assistant"
                    ? "bg-white/[0.08] border-white/10"
                    : "bg-blue-600 border-blue-500/20"
                }`}
              >
                {m.text}
              </div>
            )}
          </div>
        ))}

        {runtime?.active && (
          <div className="flex items-center justify-center gap-2 text-xs opacity-80">
            <Loader2 size={14} className="animate-spin" />
            {runtimeLabel(runtime)}
            {elapsed !== null && <span>· {elapsed}s</span>}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-3 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAttachmentMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <Paperclip size={16} />
          </button>

          <AIAttachmentMenu
            open={attachmentMenuOpen}
            onClose={() => setAttachmentMenuOpen(false)}
            onSelect={() => setAttachmentMenuOpen(false)}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
          />

          <button
            onClick={runtime?.active ? handleAbort : handleRun}
            className={`h-10 w-10 flex items-center justify-center transition ${
              runtime?.active
                ? "rounded-full bg-red-600 hover:bg-red-500"
                : "rounded-xl bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {runtime?.active ? (
              <Square size={14} />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
