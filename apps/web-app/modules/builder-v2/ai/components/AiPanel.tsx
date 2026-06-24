"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Square, Loader2, Upload, Paperclip, RefreshCw, FileText, Image as ImageIcon } from "lucide-react";
import { useAiRuntime } from "../hooks/useAiRuntime";

const { elapsed } = useAiRuntime();

/* ============================================================
   TYPES
============================================================ */

type Role = "user" | "assistant" | "system";

interface AiMessage {
  role: Role;
  text: string;
  ts: number;
  kind?: "text" | "tone-pills" | "logo-actions" | "success" | "error";
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
  onRefine?: (request: string, targetSection?: string) => void;
  hasGeneratedCode?: boolean;
}

/* ============================================================
   HELPERS
============================================================ */

const now = () => Date.now();
const STORAGE_KEY = (pageId: string) => `buildez-ai-chat:${pageId}`;

/* ============================================================
   ATTACHMENT MENU COMPONENT
============================================================ */

function AttachmentMenu({ 
  open, 
  onClose, 
  onReset 
}: { 
  open: boolean; 
  onClose: () => void; 
  onReset: () => void;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[10000]" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-[10001]">
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center gap-3 border-b border-gray-700/30"
        >
          <RefreshCw size={16} className="text-blue-400" />
          <span>Reset Chat</span>
        </button>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center gap-3"
        >
          <FileText size={16} />
          <span>Upload Document</span>
          <span className="ml-auto text-xs text-gray-500">Coming soon</span>
        </button>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center gap-3"
        >
          <ImageIcon size={16} />
          <span>Upload Image</span>
          <span className="ml-auto text-xs text-gray-500">Coming soon</span>
        </button>
      </div>
    </>
  );
}

/* ============================================================
   MAIN COMPONENT - POLISHED LOVABLE STYLE
============================================================ */

export default function AiPanel({
  pageId,
  onRunAI,
  onAbortAI,
  aiChatRuntime,
  onRequestLogoUpload,
  onRefine,
  hasGeneratedCode = false,
}: AiPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastPromptRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startTimeRef = useRef<number | null>(null);

  const isRunning = aiChatRuntime.status === "running";
  const showAttachButton = !hasGeneratedCode;

  /* ============================================================
     INIT / RESTORE CHAT HISTORY
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
        text: "Describe the website you want. I'll design the layout and generate the content for you.",
        ts: now(),
        kind: "text",
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
  }, [messages]);

  /* ============================================================
     AUTO-FOCUS INPUT
  ============================================================ */

  useEffect(() => {
    if (!isRunning) {
      inputRef.current?.focus();
    }
  }, [isRunning]);

  /* ============================================================
     ELAPSED TIMER
  ============================================================ */

  useEffect(() => {
    if (!isRunning) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const tick = () => {
      if (!startTimeRef.current) return;
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [isRunning]);


  /* ============================================================
     RESUME AI AFTER LOGO UPLOAD
  ============================================================ */

  const runFinalAI = useCallback(async () => {
    if (!lastPromptRef.current || !tone) return;

    const finalPrompt = `${lastPromptRef.current}

Tone: ${tone}

Instructions:
- Match the selected ${tone} tone in all copy and design
- Create professional, engaging content
- Use strong visual hierarchy
- Include clear calls-to-action`;

    setIsWaitingForLogo(false);

    try {
      await onRunAI(finalPrompt);
    } catch (err) {
      console.error("[AiPanel] AI execution failed:", err);
    }
  }, [onRunAI, tone]);

  useEffect(() => {
    function onLogoComplete(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail?.logoUrl || !isWaitingForLogo) return;
      runFinalAI();
    }

    window.addEventListener("ai:logo-complete", onLogoComplete);
    return () => window.removeEventListener("ai:logo-complete", onLogoComplete);
  }, [isWaitingForLogo, runFinalAI]);

  /* ============================================================
     USER PROMPT SUBMISSION
  ============================================================ */

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;

    setInput("");
    lastPromptRef.current = trimmed;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmed,
        ts: now(),
        kind: "text",
      },
    ]);

    if (hasGeneratedCode && onRefine) {
      try {
        await onRefine(trimmed);
      } catch (err) {
        console.error("[AiPanel] Refinement failed:", err);
      }
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "What tone should this website have?",
        ts: now() + 1,
        kind: "tone-pills",
      },
    ]);
  }

  /* ============================================================
     TONE SELECTION
  ============================================================ */

  function handleToneSelect(selectedTone: string) {
    setTone(selectedTone);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: selectedTone,
        ts: now(),
        kind: "text",
      },
      {
        role: "assistant",
        text: "Upload your logo to extract brand colors. You can skip this step.",
        ts: now() + 1,
        kind: "logo-actions",
      },
    ]);

    setIsWaitingForLogo(true);
  }

  /* ============================================================
     LOGO UPLOAD
  ============================================================ */

  function handleLogoUpload() {
    onRequestLogoUpload();
  }

  function handleSkipLogo() {
    setIsWaitingForLogo(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: "Skip",
        ts: now(),
        kind: "text",
      },
    ]);

    runFinalAI();
  }

  /* ============================================================
     ABORT
  ============================================================ */

  function handleAbort() {
    onAbortAI();
    startTimeRef.current = null;
    setElapsed(0);
  }

  /* ============================================================
     RESET CHAT
  ============================================================ */

  function handleResetChat() {
    setMessages([
      {
        role: "assistant",
        text: "Describe the website you want. I'll design the layout and generate the content for you.",
        ts: now(),
        kind: "text",
      },
    ]);

    setInput("");
    setTone(null);
    setIsWaitingForLogo(false);
    lastPromptRef.current = null;
    localStorage.removeItem(STORAGE_KEY(pageId));
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ✅ Global CSS for Marquee Placeholder */}
      <style>{`
        @keyframes marquee-placeholder {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .marquee-input::placeholder {
          white-space: nowrap;
          overflow: visible;
          animation: marquee-placeholder 20s linear infinite;
        }

        .marquee-input:focus::placeholder {
          animation-play-state: paused;
          opacity: 0;
        }

        .marquee-input:not(:placeholder-shown)::placeholder {
          display: none;
        }
      `}</style>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isSystem = msg.role === "system";

          // System messages (success/error)
          if (isSystem) {
            return (
              <div key={msg.ts} className="flex justify-center">
                <div
                  className={`px-4 py-2 rounded-full text-xs font-medium ${
                    msg.kind === "success"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          }

          // Tone selection pills
          if (msg.kind === "tone-pills" && !tone) {
            return (
              <div key={msg.ts} className="flex gap-3">
                {/* AI Avatar - Glassmorphism */}
                <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm">✨</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="px-5 py-3.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-xl">
                    {msg.text}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Professional", "Friendly", "Premium", "Bold"].map(
                      (toneOption) => (
                        <button
                          key={toneOption}
                          onClick={() => handleToneSelect(toneOption)}
                          className="px-4 py-2 bg-gray-700/50 hover:bg-blue-600/80 border border-gray-600/50 hover:border-blue-500/50 rounded-full text-xs font-medium text-gray-200 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {toneOption}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Logo upload actions
          if (msg.kind === "logo-actions" && isWaitingForLogo) {
            return (
              <div key={msg.ts} className="flex gap-3">
                {/* AI Avatar - Glassmorphism */}
                <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm">✨</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="px-5 py-3.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-xl">
                    {msg.text}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleLogoUpload}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500/50 rounded-full text-xs font-medium text-white transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <Upload size={14} />
                      Upload logo
                    </button>

                    <button
                      onClick={handleSkipLogo}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/80 border border-gray-600/50 rounded-full text-xs font-medium text-gray-200 hover:text-white transition-all duration-200 shadow-md"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Regular text messages
          return (
            <div
              key={msg.ts}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                // AI Avatar - Glassmorphism
                <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm">✨</span>
                </div>
              )}

              <div
                className={`max-w-[80%] px-5 py-3.5 text-sm shadow-xl ${
                  isUser
                    ? "bg-[rgb(38,99,235)] text-white rounded-2xl rounded-tr-none"
                    : "bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-200 rounded-2xl rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>

              {isUser && (
                // User Avatar - Glassmorphism
                <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm">👤</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isRunning && (
          <div className="flex justify-center">
            <div className="px-5 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center gap-3 shadow-xl">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-sm text-gray-300">
                AI working… {elapsed}s
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ✅ Input Area with Marquee Placeholder */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700/50">
        <div className="relative">
          {/* Attachment button with working menu */}
          {showAttachButton && (
            <>
              <button
                onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/80 flex items-center justify-center transition-all z-10"
                title="Attachments"
              >
                <Paperclip size={18} className="text-gray-400" />
              </button>

              <AttachmentMenu
                open={attachmentMenuOpen}
                onClose={() => setAttachmentMenuOpen(false)}
                onReset={handleResetChat}
              />
            </>
          )}

          {/* ✅ Textarea with Marquee Placeholder */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isRunning) handleSend();
              }
            }}
            placeholder="Describe the website you want. I'll design the layout and generate the content for you. Tell me about your business, target audience, and any specific features you need..."
            disabled={isRunning}
            className={`marquee-input w-full ${
              showAttachButton ? "pl-14" : "pl-4"
            } pr-14 py-3.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg overflow-hidden`}
            rows={1}
            style={{
              minHeight: "48px",
              maxHeight: "120px",
            }}
          />

          {/* Send/Stop button */}
          <button
            onClick={isRunning ? handleAbort : handleSend}
            disabled={!input.trim() && !isRunning}
            className={`absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isRunning
                ? "rounded-full bg-red-600 hover:bg-red-500"
                : "rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700"
            }`}
          >
            {isRunning ? (
              <Square size={16} className="text-white" fill="white" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
