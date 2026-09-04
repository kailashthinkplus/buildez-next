"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Loader2, Paperclip, RotateCcw, Send, Sparkles, Square, X } from "lucide-react";

import {
  AI_ATTACHMENT_ACCEPT,
  getAgentAttachmentError,
} from "@/modules/ai-v12/attachments";
import {
  COLOR_MOOD_OPTIONS,
  DEFAULT_CREATIVE_DIRECTION,
  DENSITY_OPTIONS,
  DESIGN_STYLE_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  MOTION_STYLE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  type CreativeDirection,
} from "@/modules/ai-v12/creativeDirection";

export type V12AgentContext =
  | "Website"
  | "Page"
  | "Selected element"
  | "Image";

export type V12AgentEvent = Readonly<{
  id: string;
  type: "message" | "tool.started" | "tool.completed" | "tool.failed";
  title: string;
  detail?: string;
  timestamp: string;
  role?: "user" | "assistant";
}>;

export default function V12AgentPanel({
  connected,
  events,
  running,
  onSubmit,
  onCancel,
  onReset,
  onClose,
  initialPrompt = "",
  initialContext = "Website",
  autoFocus = false,
}: {
  connected: boolean;
  events: readonly V12AgentEvent[];
  running: boolean;
  initialPrompt?: string;
  initialContext?: V12AgentContext;
  autoFocus?: boolean;
  onSubmit(prompt: string, mode: "auto" | "discuss", attachments: readonly File[], creativeDirection: CreativeDirection, context: V12AgentContext): Promise<void>;
  onCancel(): void;
  onReset(): Promise<void>;
  onClose(): void;
}) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"auto" | "discuss">("auto");
  const [context, setContext] = useState<V12AgentContext>(initialContext);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [creativeDirection, setCreativeDirection] = useState<CreativeDirection>(DEFAULT_CREATIVE_DIRECTION);
  const [directionReady, setDirectionReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const appliedInitialPromptRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [directionVersion, setDirectionVersion] = useState(0);
  const [showProTips, setShowProTips] = useState(true);
  const [pendingFullPagePrompt, setPendingFullPagePrompt] = useState<string | null>(null);
  const [pendingFullPageAttachments, setPendingFullPageAttachments] = useState<File[]>([]);
  const [pendingFullPageMode, setPendingFullPageMode] = useState<"auto" | "discuss">("auto");
  const [pendingFullPageContext, setPendingFullPageContext] = useState<V12AgentContext>("Page");
  const [showCreativeDirection, setShowCreativeDirection] = useState(false);

  useEffect(() => {
    if (appliedInitialPromptRef.current) return;

    appliedInitialPromptRef.current = true;

    const value = initialPrompt.trim();
    if (value) {
      setPrompt(value);
    }

    setContext(initialContext);

    if (autoFocus || value) {
      window.requestAnimationFrame(() => {
        composerRef.current?.focus();

        if (value) {
          const length = value.length;
          composerRef.current?.setSelectionRange(length, length);
        }
      });
    }
  }, [autoFocus, initialContext, initialPrompt]);

  useEffect(() => {
    try {
      setShowProTips(
        window.localStorage.getItem("buildez-pro-tips-dismissed") !== "1"
      );
    } catch {
      setShowProTips(true);
    }
  }, []);

  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  async function submit() {
    const value = prompt.trim();

    if (
      running ||
      showCreativeDirection ||
      (!value && attachments.length === 0) ||
      !connected
    ) {
      return;
    }

    const submittedAttachments = attachments;

    setPrompt("");
    setAttachments([]);

    const isFirstFullPagePrompt =
      events.length === 0 &&
      (context === "Website" || context === "Page");

    if (isFirstFullPagePrompt) {
      setPendingFullPagePrompt(value);
      setPendingFullPageAttachments(submittedAttachments);
      setPendingFullPageMode(mode);
      setPendingFullPageContext(context);
      setCreativeDirection(DEFAULT_CREATIVE_DIRECTION);
      setDirectionReady(false);
      setDirectionVersion(version => version + 1);
      setShowCreativeDirection(true);
      return;
    }

    await onSubmit(
      value,
      mode,
      submittedAttachments,
      creativeDirection,
      context
    );
  }

  async function completeCreativeDirection() {
    if (!pendingFullPagePrompt || running || !connected) return;

    const value = pendingFullPagePrompt;
    const submittedAttachments = pendingFullPageAttachments;
    const submittedMode = pendingFullPageMode;
    const submittedContext = pendingFullPageContext;

    setDirectionReady(true);
    setShowCreativeDirection(false);
    setPendingFullPagePrompt(null);
    setPendingFullPageAttachments([]);

    await onSubmit(
      value,
      submittedMode,
      submittedAttachments,
      creativeDirection,
      submittedContext
    );
  }

  function selectAttachments(selected: File[]) {
    const nextAttachments = [...attachments, ...selected];
    const error = getAgentAttachmentError(nextAttachments);

    if (error) {
      setAttachmentError(error);
      return;
    }

    setAttachmentError("");
    setAttachments(nextAttachments);
  }

  async function resetChat() {
    if (running || resetting) return;
    setResetting(true);
    setPrompt("");
    setMode("auto");
    setContext(initialContext);
    setAttachments([]);
    setAttachmentError("");
    setCreativeDirection(DEFAULT_CREATIVE_DIRECTION);
    setDirectionReady(false);
    setDirectionVersion(version => version + 1);
    setPendingFullPagePrompt(null);
    setPendingFullPageAttachments([]);
    setPendingFullPageMode("auto");
    setPendingFullPageContext("Page");
    setShowCreativeDirection(false);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  }

  return <aside className="flex h-full w-[360px] shrink-0 flex-col bg-[#15171c]">
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
      <div><strong>Build with AI</strong><p className="mt-0.5 text-xs text-white/40">Create and refine your website</p></div>
      <div className="flex items-center gap-1">
        <button onClick={() => void resetChat()} disabled={running || resetting} aria-label="Reset AI chat" title="Reset AI chat" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"><RotateCcw size={17} className={resetting ? "animate-spin" : ""}/></button>
        <button onClick={onClose} aria-label="Close AI panel" title="Close AI panel" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
      </div>
    </div>

    <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
      <div className="flex flex-wrap gap-1.5">{(["Website", "Page", "Selected element", "Image"] as const).map(value => <button key={value} onClick={() => setContext(value)} className={`rounded-full border px-2.5 py-1 text-[11px] ${context === value ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-white/40"}`}>{value}</button>)}</div>
      {!events.length && showProTips && (
        <ProTipsCarousel
          onClose={() => {
            setShowProTips(false);
            try {
              window.localStorage.setItem(
                "buildez-pro-tips-dismissed",
                "1"
              );
            } catch {
              // Ignore storage failures.
            }
          }}
        />
      )}
      {!events.length && !pendingFullPagePrompt && !showCreativeDirection && (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-white/45">
          Describe the website, page, or focused change you want. Agent activity will appear here only after a real operation occurs.
        </div>
      )}

      {pendingFullPagePrompt && (
        <div className="ml-8 flex justify-end">
          <div className="max-w-full rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-md shadow-blue-950/30">
            {pendingFullPagePrompt || "Replicate the attached design"}
            {pendingFullPageAttachments.length > 0 && (
              <div className="mt-1 text-[11px] text-blue-100/70">
                {pendingFullPageAttachments.map(file => file.name).join(", ")}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreativeDirection && (
        <div className="mr-2 flex justify-start">
          <div className="w-full rounded-2xl rounded-bl-md border border-white/10 bg-[#242833] p-4 text-white/90 shadow-md shadow-black/20">
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles size={15} className="text-blue-300"/>
                Creative direction
              </div>
              <p className="mt-1 text-[11px] leading-4 text-white/45">
                Before I generate the full page, choose the visual direction.
              </p>
            </div>

            <CreativeDirectionWizard
              key={directionVersion}
              value={creativeDirection}
              onChange={setCreativeDirection}
              onComplete={() => void completeCreativeDirection()}
            />
          </div>
        </div>
      )}
      {events.map((event) => event.type === "message" ? (
        <div key={event.id} className={`flex ${event.role === "assistant" ? "mr-6 justify-start" : "ml-8 justify-end"}`}>
          <div className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-6 shadow-md ${event.role === "assistant" ? "rounded-bl-md border border-white/10 bg-[#242833] text-white/90 shadow-black/20" : "rounded-br-md bg-blue-600 text-white shadow-blue-950/30"}`}>
            {event.title}
            {event.detail && <div className="mt-1 text-[11px] text-blue-100/70">{event.detail}</div>}
          </div>
        </div>
      ) : (
        <details key={event.id} className="rounded-xl border border-white/10 bg-white/[0.045] p-3" open={event.type === "tool.failed"}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm"><ChevronRight size={14} className="text-white/40"/><span className="flex-1">{event.title}</span><span className={`h-2 w-2 rounded-full ${event.type === "tool.failed" ? "bg-red-400" : event.type === "tool.completed" ? "bg-emerald-400" : "bg-blue-400"}`}/></summary>
          {event.detail && <p className="mt-2 pl-6 text-xs leading-5 text-white/50">{event.detail}</p>}
        </details>
      ))}
      {running && <div className="overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-sky-400/[0.03] p-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3"><span className="relative grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><Sparkles size={18} className="animate-pulse"/><span className="absolute inset-0 animate-ping rounded-xl border border-blue-400/20"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-medium text-white"><Loader2 size={15} className="animate-spin text-blue-300"/>BuildEZ is working</div><p className="mt-1 text-xs text-white/45">Analyzing, designing and engineering your page</p></div><span className="font-mono text-xs tabular-nums text-blue-200/65">{elapsedLabel}</span></div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full w-1/3 animate-[ai-agent-progress_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-sky-300 to-blue-500"/></div>
        {elapsed >= 90 && <p className="mt-3 text-[11px] leading-4 text-white/40">Complex reference builds can take several minutes. You can stop safely at any time.</p>}
      </div>}
    </div>

    <div className="border-t border-white/10 p-3">
      {attachments.length > 0 && <div className="mb-2 grid grid-cols-2 gap-2">{attachments.map((file, index) => <AttachmentPreview key={`${file.name}-${file.lastModified}`} file={file} onRemove={() => { setAttachments(files => files.filter((_, itemIndex) => itemIndex !== index)); setAttachmentError(""); }}/>)}</div>}
      <textarea
        ref={composerRef}
        value={prompt}
        disabled={showCreativeDirection}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder={
          showCreativeDirection
            ? "Complete the creative direction above…"
            : "What would you like to build or change?"
        }
        aria-describedby="ai-composer-hint"
        className="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <p id="ai-composer-hint" className="mt-1 px-1 text-[10px] text-white/30">Enter to send · images/files 50 MB · ZIP projects up to 1 GB</p>
      {attachmentError && <p role="alert" className="mt-1 px-1 text-[11px] text-red-300">{attachmentError}</p>}
      <div className="mt-2 flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept={AI_ATTACHMENT_ACCEPT} multiple className="hidden" onChange={(event) => { selectAttachments(Array.from(event.target.files ?? [])); event.target.value = ""; }}/>
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach a design, file, or ZIP project" title="Attach files (50 MB) or one ZIP project (1 GB)" className="rounded-lg p-2 text-white/55 hover:bg-white/10"><Paperclip size={16}/></button>
        <select value={mode} onChange={(event) => setMode(event.target.value as "auto" | "discuss")} className="rounded-lg bg-white/5 px-2 py-2 text-xs"><option value="auto">Auto</option><option value="discuss">Discuss</option></select>
        <div className="flex-1"/>
        {running ? (
          <button
            onClick={onCancel}
            aria-label="Stop agent"
            className="rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-red-400 hover:bg-red-500/25"
          >
            <Square size={15} fill="currentColor"/>
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={
              !connected ||
              showCreativeDirection ||
              (!prompt.trim() && attachments.length === 0)
            }
            aria-label="Send message"
            title={
              showCreativeDirection
                ? "Complete the creative direction above"
                : "Send message"
            }
            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500 disabled:opacity-30"
          >
            <Send size={15}/>
          </button>
        )}
      </div>
    </div>
  </aside>;
}


function ProTipsCarousel({ onClose }: { onClose(): void }) {
  const tips = [
    {
      eyebrow: "Design to code",
      title: "Already have a UI design?",
      body:
        "Upload a screenshot, Figma export, UI image or PDF and BuildEZ AI can recreate the design as production-ready React code.",
      gif: "/pro-tips/ui-to-code.gif",
      alt: "AI converting an existing UI design into website code",
      accent: "from-blue-500/20 via-sky-400/10 to-transparent",
    },
    {
      eyebrow: "Immersive experiences",
      title: "Build rich 3D & animated websites",
      body:
        "Ask for cinematic scroll experiences, parallax, shaders, WebGL, interactive product showcases, 3D scenes and advanced motion.",
      gif: "/pro-tips/immersive-3d.gif",
      alt: "Interactive 3D animated website experience",
      accent: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
    },
    {
      eyebrow: "Traditional websites",
      title: "Or keep it beautifully simple",
      body:
        "Build professional corporate, SaaS, healthcare, portfolio, commerce and landing pages with responsive layouts and polished interactions.",
      gif: "/pro-tips/traditional-site.gif",
      alt: "Modern traditional business website",
      accent: "from-emerald-500/20 via-cyan-400/10 to-transparent",
    },
  ] as const;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % tips.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [tips.length]);

  const tip = tips[index];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1b1f27] shadow-lg shadow-black/20">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tip.accent}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-300/20 bg-amber-400/10">
              <ProTipBulbIcon />
            </span>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                Pro tips
              </div>
              <div className="mt-0.5 text-xs text-white/45">
                Get more from BuildEZ AI
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pro tips"
            title="Hide pro tips"
            className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
            <img
              key={tip.gif}
              src={tip.gif}
              alt={tip.alt}
              className="aspect-[16/9] w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-blue-300/80">
            {tip.eyebrow}
          </div>

          <h3 className="mt-1 text-sm font-semibold leading-5 text-white">
            {tip.title}
          </h3>

          <p className="mt-1.5 text-[11px] leading-[1.55] text-white/50">
            {tip.body}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              {tips.map((_, tipIndex) => (
                <button
                  key={tipIndex}
                  type="button"
                  aria-label={`Show pro tip ${tipIndex + 1}`}
                  onClick={() => setIndex(tipIndex)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === tipIndex
                      ? "w-5 bg-blue-400"
                      : "w-1.5 bg-white/20 hover:bg-white/35"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous pro tip"
                onClick={() =>
                  setIndex(
                    (current) =>
                      (current - 1 + tips.length) % tips.length
                  )
                }
                className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                aria-label="Next pro tip"
                onClick={() =>
                  setIndex((current) => (current + 1) % tips.length)
                }
                className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProTipBulbIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="buildez-tip-bulb"
          x1="5"
          y1="3"
          x2="18"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDE68A" />
          <stop offset="0.5" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>

      <path
        d="M8.4 15.1c-1.45-1.07-2.4-2.8-2.4-4.75A6 6 0 0 1 12 4.3a6 6 0 0 1 6 6.05c0 1.95-.95 3.68-2.4 4.75-.72.53-1.1 1.12-1.22 1.9H9.62c-.12-.78-.5-1.37-1.22-1.9Z"
        stroke="url(#buildez-tip-bulb)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9.7 19h4.6M10.5 21h3"
        stroke="#FBBF24"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M12 1.5v1M3.7 5l.8.6M20.3 5l-.8.6M2 11h1.2M20.8 11H22"
        stroke="#FDE68A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreativeDirectionWizard({ value, onChange, onComplete }: { value: CreativeDirection; onChange(value: CreativeDirection): void; onComplete(): void }) {
  const [step, setStep] = useState(0);
  const questionCount = 7;
  const next = () => setStep(current => { const nextStep = Math.min(questionCount, current + 1); if (nextStep === questionCount) onComplete(); return nextStep; });
  const choose = <K extends keyof CreativeDirection,>(key: K, selected: CreativeDirection[K]) => {
    onChange({ ...value, [key]: selected });
    next();
  };
  const questions = [
    <DirectionPills key="design" label="What visual direction should the website take?" options={DESIGN_STYLE_OPTIONS} selected={value.designStyle} onSelect={(selected) => choose("designStyle", selected)}/>,
    <DirectionPills key="images" label="What kind of imagery should it use?" options={IMAGE_STYLE_OPTIONS} selected={value.imageStyle} onSelect={(selected) => choose("imageStyle", selected)}/>,
    <DirectionPills key="color" label="What color mood fits the brand?" options={COLOR_MOOD_OPTIONS} selected={value.colorMood} onSelect={(selected) => choose("colorMood", selected)}/>,
    <DirectionPills key="density" label="How dense should the content feel?" options={DENSITY_OPTIONS} selected={value.density} onSelect={(selected) => choose("density", selected)}/>,
    <DirectionPills key="goal" label="What is the website's primary goal?" options={PRIMARY_GOAL_OPTIONS} selected={value.primaryGoal} onSelect={(selected) => choose("primaryGoal", selected)}/>,
    <DirectionPills key="motion" label="How should the website move and respond to scrolling?" options={MOTION_STYLE_OPTIONS} selected={value.motionStyle} onSelect={(selected) => choose("motionStyle", selected)}/>,
    <div key="audience">
      <label className="block text-xs font-medium text-white/85">Who is the website for?
        <input value={value.audience} onChange={(event) => onChange({ ...value, audience: event.target.value.slice(0, 160) })} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); next(); } }} placeholder="e.g. operations leaders at mid-size companies" className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-xs font-normal text-white outline-none placeholder:text-white/25 focus:border-blue-400/60"/>
      </label>
      <button type="button" onClick={next} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-500">{value.audience.trim() ? "Continue" : "Skip"}<ChevronRight size={13}/></button>
    </div>,
  ];

  return <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div><strong className="text-xs text-white/85">Creative direction</strong><p className="mt-1 text-[11px] leading-4 text-white/40">{step < questionCount ? `Question ${step + 1} of ${questionCount}` : "Ready to generate"}</p></div>
      {step > 0 && <button type="button" onClick={() => setStep(current => Math.max(0, current - 1))} className="rounded-md px-2 py-1 text-[10px] text-white/45 hover:bg-white/10 hover:text-white">Back</button>}
    </div>
    <div className="mb-3 flex gap-1" aria-hidden="true">{Array.from({ length: questionCount }, (_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index < step ? "bg-blue-400" : index === step ? "bg-blue-400/60" : "bg-white/10"}`}/>)}</div>
    {step < questionCount ? questions[step] : <div>
      <p className="text-xs leading-5 text-white/65">{value.designStyle} design · {value.imageStyle} imagery · {value.motionStyle.toLowerCase()} · {value.colorMood.toLowerCase()} palette · {value.density.toLowerCase()} content{value.audience ? ` · for ${value.audience}` : ""}</p>
      <button type="button" onClick={() => setStep(0)} className="mt-2 text-[11px] font-medium text-blue-300 hover:text-blue-200">Review choices</button>
    </div>}
  </div>;
}

function DirectionPills<T extends string>({ label, options, selected, onSelect }: { label: string; options: readonly T[]; selected: T; onSelect(value: T): void }) {
  return <fieldset>
    <legend className="mb-2 text-xs font-medium leading-5 text-white/85">{label}</legend>
    <div className="flex flex-wrap gap-1.5">{options.map(option => <button type="button" key={option} onClick={() => onSelect(option)} aria-pressed={selected === option} className={`rounded-full border px-2.5 py-1 text-[10px] transition ${selected === option ? "border-blue-400/50 bg-blue-500/20 text-blue-100" : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/20 hover:text-white/70"}`}>{option}</button>)}</div>
  </fieldset>;
}

function AttachmentPreview({ file, onRemove }: { file: File; onRemove(): void }) {
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => {
    if (!file.type.startsWith("image/")) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className="group relative overflow-hidden rounded-xl border border-blue-400/20 bg-blue-500/10">
    <div className="grid h-24 place-items-center overflow-hidden bg-black/20">
      {previewUrl ? <img src={previewUrl} alt={`Attachment preview: ${file.name}`} className="h-full w-full object-cover"/> : <FileText size={28} className="text-blue-200/60"/>}
    </div>
    <div className="p-2 text-[10px] text-blue-100"><div className="truncate font-medium">{file.name}</div><div className="mt-0.5 text-blue-200/45">{formatFileSize(file.size)}</div></div>
    <button onClick={onRemove} aria-label={`Remove ${file.name}`} className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1 text-white/75 opacity-80 hover:bg-red-500 hover:text-white"><X size={12}/></button>
  </div>;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
