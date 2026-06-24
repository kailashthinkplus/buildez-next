// /Users/kailash/buildez/apps/web-app/app/app/(builder)/[siteSlug]/[pageSlugWithId]/sidebar/ai.v7/AiPanel.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Square,
  Loader2,
  Bot,
  User,
  Paperclip,
  Upload,
} from "lucide-react";

import { AIAttachmentMenu } from "@/app/app/components/ai/AIAttachmentMenu";

/* ============================================================
   TYPES
============================================================ */

type Role = "user" | "assistant";
type FlowStage = "idle" | "tone" | "logo" | "running";

interface AiMessage {
  role: Role;
  text: string;
  ts: number;
  kind?: "text" | "pills" | "logo";
}

interface AIRefinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
}

interface AiPanelProps {
  pageId: string;
  onRunAI: (prompt: string) => Promise<void>;
  onAbortAI: () => void;
  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };
  onRequestLogoUpload(): void;
}

/* ============================================================
   HELPERS
============================================================ */

const now = () => Date.now();
const STORAGE_KEY = (pageId: string) => `buildez-ai-chat-v8:${pageId}`; // ✅ Changed key to v8

/* ============================================================
   COMPONENT
============================================================ */

export default function AiPanel({
  pageId,
  onRunAI,
  onAbortAI,
  aiChatRuntime,
  onRequestLogoUpload,
}: AiPanelProps) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [flowStage, setFlowStage] = useState<FlowStage>("idle");
  const [tone, setTone] = useState<AIRefinements["tone"]>(null);

  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastPromptRef = useRef<string | null>(null);
  const runningRef = useRef(false);

  const startTimeRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const isRunning = flowStage === "running";

  /* ============================================================
     INIT / RESTORE
  ============================================================ */

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY(pageId));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          return;
        }
      } catch {}
    }

    setMessages([
      {
        role: "assistant",
        text: "Describe the website you want. I'll generate a complete design with AI-powered HTML.", // ✅ Updated message
        ts: now(),
      },
    ]);
  }, [pageId]);

  /* ============================================================
     PERSIST CHAT
  ============================================================ */

  useEffect(() => {
    if (messages.length) {
      localStorage.setItem(STORAGE_KEY(pageId), JSON.stringify(messages));
    }
  }, [messages, pageId]);

  /* ============================================================
     AUTOSCROLL
  ============================================================ */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, flowStage]);

  /* ============================================================
     AI RUNTIME SYNC
  ============================================================ */

  useEffect(() => {
    if (aiChatRuntime.status === "running") {
      startTimeRef.current = Date.now();
    }

    if (
      aiChatRuntime.status === "success" ||
      aiChatRuntime.status === "error"
    ) {
      runningRef.current = false;
      setFlowStage("idle");
      startTimeRef.current = null;
      setElapsed(0);

      // ✅ Add success message
      if (aiChatRuntime.status === "success") {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: aiChatRuntime.message || "✅ Your website is ready! Check the preview above.",
            ts: now(),
          },
        ]);
      }

      // ✅ Add error message
      if (aiChatRuntime.status === "error") {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `❌ ${aiChatRuntime.message || "Generation failed. Please try again."}`,
            ts: now(),
          },
        ]);
      }
    }
  }, [aiChatRuntime.status, aiChatRuntime.message]);

  /* ============================================================
     ELAPSED TIMER
  ============================================================ */

  useEffect(() => {
    if (!isRunning || !startTimeRef.current) return;

    const i = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);

    return () => clearInterval(i);
  }, [isRunning]);

  /* ============================================================
     RESUME AI AFTER LOGO UPLOAD
  ============================================================ */

  useEffect(() => {
    function onLogoComplete(e: Event) {
      if (runningRef.current) return;

      const detail = (e as CustomEvent).detail;
      if (!detail?.logoUrl) return;
      if (flowStage !== "logo") return;

      runFinalAI();
    }

    window.addEventListener("ai:logo-complete", onLogoComplete);
    return () => window.removeEventListener("ai:logo-complete", onLogoComplete);
  }, [flowStage]);

  /* ============================================================
     FINAL AI EXECUTION (AI-V8)
  ============================================================ */

  async function runFinalAI() {
    if (!lastPromptRef.current || !tone || runningRef.current) return;

    runningRef.current = true;
    setFlowStage("running");

    // ✅ Enhanced prompt for AI-V8 HTML generation
    const finalPrompt = `Create a ${tone} website for: ${lastPromptRef.current}

Style Requirements:
- Tone: ${tone}
- Professional layout with clear hierarchy
- Modern, clean design
- Strong visual identity
- Photorealistic images
`;

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: "🎨 Generating your website with AI...",
        ts: now(),
      },
    ]);

    try {
      await onRunAI(finalPrompt);
    } catch (err) {
      console.error("[AiPanel] AI execution failed:", err);
    } finally {
      runningRef.current = false;
    }
  }

  /* ============================================================
     USER PROMPT
  ============================================================ */

  function handleRun() {
    if (!input.trim() || runningRef.current) return;

    const prompt = input.trim();
    setInput("");
    lastPromptRef.current = prompt;

    setMessages((m) => [
      ...m,
      { role: "user", text: prompt, ts: now() },
      {
        role: "assistant",
        text: "What tone should this website have?",
        ts: now() + 1,
        kind: "pills",
      },
    ]);

    setFlowStage("tone");
  }

  /* ============================================================
     ABORT / RESET
  ============================================================ */

  function handleAbort() {
    onAbortAI();
    runningRef.current = false;
    setFlowStage("idle");
    startTimeRef.current = null;
    setElapsed(0);

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: "⚠️ Generation cancelled.",
        ts: now(),
      },
    ]);
  }

  function handleResetChat() {
    lastPromptRef.current = null;
    runningRef.current = false;

    setMessages([
      {
        role: "assistant",
        text: "Describe the website you want. I'll generate a complete design with AI-powered HTML.",
        ts: now(),
      },
    ]);

    setInput("");
    setTone(null);
    setFlowStage("idle");

    startTimeRef.current = null;
    setElapsed(0);

    localStorage.removeItem(STORAGE_KEY(pageId));
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="h-full flex flex-col px-2 py-2 text-white/90">
      {/* ✅ AI-V8 Badge */}
      <div className="mb-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg text-xs text-center">
        🚀 Powered by AI-V8 (HTML Generation)
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.ts}
              className={`flex gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                {m.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
              </div>

              {m.kind === "pills" && flowStage === "tone" ? (
                <div className="flex flex-wrap gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3">
                  {(["professional", "friendly", "premium", "bold"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTone(t);
                          setFlowStage("logo");
                          setMessages((m) => [
                            ...m,
                            {
                              role: "assistant",
                              text: "Upload your logo to extract brand colors, or skip to generate with default colors.",
                              ts: now(),
                              kind: "logo",
                            },
                          ]);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-blue-500/20 transition capitalize"
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              ) : m.kind === "logo" && flowStage === "logo" ? (
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={onRequestLogoUpload}
                      className="px-3 py-1.5 rounded-full text-xs bg-blue-600 text-white flex items-center gap-1 hover:bg-blue-700 transition"
                    >
                      <Upload size={12} />
                      Upload logo
                    </button>

                    <button
                      onClick={runFinalAI}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-blue-500/20 transition"
                    >
                      Skip & Generate
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] px-4 py-3 text-sm rounded-2xl border backdrop-blur-md ${
                    isUser
                      ? "bg-blue-500/20 border-blue-400/30 text-blue-50"
                      : "bg-white/[0.08] border-white/10"
                  }`}
                >
                  {m.text}
                </div>
              )}
            </div>
          );
        })}

        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-xs opacity-80">
            <Loader2 size={14} className="animate-spin" />
            AI generating HTML… {elapsed}s
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-3 p-2 rounded-2xl bg-black/40 border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAttachmentMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <Paperclip size={16} />
          </button>

          <AIAttachmentMenu
            open={attachmentMenuOpen}
            onClose={() => setAttachmentMenuOpen(false)}
            onSelect={() => setAttachmentMenuOpen(false)}
            onReset={handleResetChat}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="Describe what you want to build…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
            disabled={isRunning}
          />

          <button
            onClick={isRunning ? handleAbort : handleRun}
            disabled={!input.trim() && !isRunning}
            className={`h-10 w-10 flex items-center justify-center transition ${
              isRunning
                ? "rounded-full bg-red-600 hover:bg-red-700"
                : "rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isRunning ? <Square size={14} /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
