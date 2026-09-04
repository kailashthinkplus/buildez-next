"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, FileText, Globe2, ImagePlus, Loader2, Paperclip, RotateCcw, Send, Sparkles, Square, Star, Upload, Wand2, X, Zap } from "lucide-react";

import {
  AI_ATTACHMENT_ACCEPT,
  AI_ATTACHMENT_MAX_BYTES,
  getAgentAttachmentError,
  getAgentAttachmentKind,
} from "@/modules/ai-v12/attachments";
import { PromptGeneratorModal } from "./PromptGeneratorModal";
import {
  COLOR_MOOD_OPTIONS,
  DEFAULT_CREATIVE_DIRECTION,
  DENSITY_OPTIONS,
  DESIGN_STYLE_OPTIONS,
  EXPERIENCE_TYPE_OPTIONS,
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

export type V12AgentAction = Readonly<{
  id: string;
  label: string;
  value: string;
}>;

export type V12AgentEvent = Readonly<{
  id: string;
  type: "message" | "tool.started" | "tool.completed" | "tool.failed";
  title: string;
  detail?: string;
  timestamp: string;
  role?: "user" | "assistant";
  status?: "needs_input" | "completed" | "failed";
  actions?: readonly V12AgentAction[];
  showUpgrade?: boolean;
}>;

const COMPOSER_MAX_HEIGHT = 200;

function formatMessageTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function V12AgentPanel({
  siteId,
  pageId,
  connected,
  events,
  running,
  onSubmit,
  onCancel,
  onReset,
  onClose,
  initialPrompt = "",
  initialContext = "Website",
  initialAttachments,
  selectedElementLabel,
  autoFocus = false,
  autoSubmit = false,
}: {
  siteId: string;
  pageId?: string;
  connected: boolean;
  events: readonly V12AgentEvent[];
  running: boolean;
  initialPrompt?: string;
  initialContext?: V12AgentContext;
  initialAttachments?: readonly File[];
  selectedElementLabel?: string;
  autoFocus?: boolean;
  autoSubmit?: boolean;
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
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const appliedInitialPromptRef = useRef(false);
  const [generationExpanded, setGenerationExpanded] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [directionVersion, setDirectionVersion] = useState(0);
  const [showProTips, setShowProTips] = useState(true);
  const [pendingFullPagePrompt, setPendingFullPagePrompt] = useState<string | null>(null);
  const [pendingFullPageAttachments, setPendingFullPageAttachments] = useState<File[]>([]);
  const [pendingFullPageMode, setPendingFullPageMode] = useState<"auto" | "discuss">("auto");
  const [pendingFullPageContext, setPendingFullPageContext] = useState<V12AgentContext>("Page");
  const [showCreativeDirection, setShowCreativeDirection] = useState(false);
  const completingCreativeDirectionRef = useRef(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [showLogoStage, setShowLogoStage] = useState(false);
  const [logoDropzoneOpen, setLogoDropzoneOpen] = useState(false);
  const [logoChoice, setLogoChoice] = useState<"upload" | "generate" | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appliedInitialPromptRef.current) return;

    appliedInitialPromptRef.current = true;

    const value = initialPrompt.trim();
    if (value) {
      setPrompt(value);
    }

    setContext(initialContext);

    if (initialAttachments?.length) {
      const attachmentIssue = getAgentAttachmentError(initialAttachments);
      if (attachmentIssue) {
        setAttachmentError(attachmentIssue);
      } else {
        setAttachments([...initialAttachments]);
      }
    }

    if (autoFocus || value) {
      window.requestAnimationFrame(() => {
        composerRef.current?.focus();

        if (value) {
          const length = value.length;
          composerRef.current?.setSelectionRange(length, length);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus, initialContext, initialPrompt]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = "auto";
    composer.style.height = `${Math.min(composer.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
  }, [prompt]);

  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const elapsedLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!logoFile) { setLogoPreviewUrl(""); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    /*
     * Generator-style status UX:
     * keep the live status compact by default.
     * The user can expand it to inspect completed steps.
     */
    if (running) {
      setGenerationExpanded(false);
      return;
    }

    if (!events.length) {
      return;
    }

    setGenerationExpanded(false);
  }, [running, events.length]);

  async function dispatchPrompt(
    value: string,
    submittedAttachments: File[],
    submitMode: "auto" | "discuss",
    submitContext: V12AgentContext,
  ) {
    if (
      running ||
      showCreativeDirection ||
      showLogoStage ||
      (!value && submittedAttachments.length === 0) ||
      !connected
    ) {
      return;
    }

    const isFirstFullPagePrompt =
      events.length === 0 &&
      (submitContext === "Website" || submitContext === "Page");

    if (isFirstFullPagePrompt) {
      setPendingFullPagePrompt(value);
      setPendingFullPageAttachments(submittedAttachments);
      setPendingFullPageMode(submitMode);
      setPendingFullPageContext(submitContext);
      setCreativeDirection(DEFAULT_CREATIVE_DIRECTION);
      setDirectionReady(false);
      setDirectionVersion(version => version + 1);
      setLogoChoice(null);
      setLogoFile(null);
      setLogoUrl("");
      setLogoError("");
      setLogoDropzoneOpen(false);
      setShowLogoStage(true);
      return;
    }

    await onSubmit(
      value,
      submitMode,
      submittedAttachments,
      creativeDirection,
      submitContext
    );
  }

  async function submit() {
    const value = prompt.trim();

    if (
      running ||
      showCreativeDirection ||
      showLogoStage ||
      (!value && attachments.length === 0) ||
      !connected
    ) {
      return;
    }

    const submittedAttachments = attachments;

    setPrompt("");
    setAttachments([]);

    await dispatchPrompt(value, submittedAttachments, mode, context);
  }

  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (autoSubmittedRef.current || !autoSubmit || !connected) return;
    const value = initialPrompt.trim();
    if (!value) return;
    autoSubmittedRef.current = true;
    setPrompt("");
    void dispatchPrompt(value, [], "auto", initialContext);
  }, [autoSubmit, connected, initialContext, initialPrompt]);

  async function completeCreativeDirection() {
    if (
      !pendingFullPagePrompt ||
      running ||
      !connected ||
      completingCreativeDirectionRef.current
    ) return;

    completingCreativeDirectionRef.current = true;

    const logoInstruction =
      logoChoice === "upload" && logoUrl
        ? `\n\nA brand logo has already been uploaded and saved for this site at ${logoUrl}. Use this exact image as the website's logo in the header (and footer if appropriate) — reference the project's branding logo asset rather than generating or fabricating a different logo.`
        : logoChoice === "generate"
          ? `\n\nThis brand does not have a logo yet. Design and generate an original, simple, brand-appropriate logotype or mark as part of this website and feature it in the header.`
          : "";

    const value = `${pendingFullPagePrompt}${logoInstruction}`;
    const submittedAttachments = pendingFullPageAttachments;
    const submittedMode = pendingFullPageMode;
    const submittedContext = pendingFullPageContext;

    setDirectionReady(true);
    setShowCreativeDirection(false);
    setPendingFullPagePrompt(null);
    setPendingFullPageAttachments([]);

    try {
      await onSubmit(
        value,
        submittedMode,
        submittedAttachments,
        creativeDirection,
        submittedContext
      );
    } finally {
      completingCreativeDirectionRef.current = false;
    }
  }

  function openLogoUpload() {
    setLogoError("");
    setLogoDropzoneOpen(true);
  }

  function chooseGenerateLogo() {
    if (logoUploading) return;
    setLogoChoice("generate");
    setShowLogoStage(false);
    setShowCreativeDirection(true);
  }

  async function handleLogoFileSelected(file: File) {
    const kind = getAgentAttachmentKind(file);
    if (kind !== "image") {
      setLogoError("Upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > AI_ATTACHMENT_MAX_BYTES) {
      setLogoError("Logo must be smaller than 50 MB.");
      return;
    }

    setLogoError("");
    setLogoFile(file);
    setLogoUploading(true);

    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(
        `/api/sites/${encodeURIComponent(siteId)}/branding/logo?overwrite=true`,
        { method: "POST", body: form },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Logo upload failed.");
      setLogoUrl(payload.logoUrl || "");
    } catch (reason) {
      setLogoError(reason instanceof Error ? reason.message : "Logo upload failed.");
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoUrl("");
    setLogoError("");
  }

  function continueAfterLogoUpload() {
    if (!logoUrl || logoUploading) return;
    setLogoChoice("upload");
    setShowLogoStage(false);
    setShowCreativeDirection(true);
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
    setShowLogoStage(false);
    setLogoDropzoneOpen(false);
    setLogoChoice(null);
    setLogoFile(null);
    setLogoUrl("");
    setLogoError("");
    setLogoUploading(false);
    setShowProTips(true);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  }

  const latestUserMessageIndex = (() => {
    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index];

      if (
        event.type === "message" &&
        event.role === "user"
      ) {
        return index;
      }
    }

    return -1;
  })();

  const progressEvents = events
    .slice(latestUserMessageIndex + 1)
    .filter((event) => event.type !== "message");

  const selectedElementStatusLabel = (() => {
    if (context !== "Selected element") return null;

    const raw = selectedElementLabel?.trim();

    if (!raw) return "selected element";

    /*
     * This comes directly from the canvas selection.
     * Do not hardcode element types: generated/custom HTML elements
     * should automatically receive a useful status label too.
     */
    return raw.toLowerCase();
  })();

  const contextualBuildLabel = (() => {
    if (selectedElementStatusLabel) {
      return `Updating ${selectedElementStatusLabel}`;
    }

    if (context === "Page") {
      return "Building the page";
    }

    if (context === "Image") {
      return "Generating the image";
    }

    return "Building the website";
  })();

  const contextualValidationLabel = (() => {
    if (selectedElementStatusLabel) {
      return `Validating ${selectedElementStatusLabel}`;
    }

    if (context === "Page") {
      return "Validating the page";
    }

    if (context === "Image") {
      return "Validating the image";
    }

    return "Validating the website";
  })();

  const contextualFinalizingLabel = (() => {
    if (selectedElementStatusLabel) {
      return `Finalizing ${selectedElementStatusLabel}`;
    }

    if (context === "Page") {
      return "Finalizing the page";
    }

    if (context === "Image") {
      return "Finalizing the image";
    }

    return "Finalizing the website";
  })();

  const normalizeProgressTitle = (title: string) => {
    const value = title.trim();

    const mappings: Array<[RegExp, string]> = [
      [/^workspace loaded$/i, "Workspace ready"],
      [/understanding your request/i, "Understanding your request"],
      [/choosing the experience stack/i, "Choosing the experience"],
      [/researching the brand/i, "Researching the brand"],
      [/brand research/i, "Researching the brand"],
      [/visual direction/i, "Planning the design"],
      [/design architect/i, "Planning the design"],
      [/planning the design/i, "Planning the design"],
      [/design architecture/i, "Planning the design"],
      [/generating original site media/i, "Generating visuals"],
      [/generating planned visuals/i, "Generating visuals"],
      [/planned visuals ready/i, "Generating visuals"],
      [/generating visuals/i, "Generating visuals"],
      [/model response received/i, contextualBuildLabel],
      [/designing and generating/i, contextualBuildLabel],
      [/generating the project/i, contextualBuildLabel],
      [/building the project/i, contextualBuildLabel],
      [/validating/i, contextualValidationLabel],
      [/project committed/i, contextualFinalizingLabel],
      [/generation complete/i, contextualFinalizingLabel],
      [
        /^built\s+\d+\s+project\s+files?$/i,
        selectedElementStatusLabel
          ? `${selectedElementStatusLabel} updated`
          : contextualFinalizingLabel,
      ],
    ];

    for (const [pattern, normalized] of mappings) {
      if (pattern.test(value)) return normalized;
    }

    return value;
  };

  const hiddenProgressTitles = new Set([
    "Workspace loaded",
    "Workspace ready",
  ]);

  const groupedProgressMap = new Map<
    string,
    V12AgentEvent
  >();

  for (const event of progressEvents) {
    const title = normalizeProgressTitle(event.title);

    if (hiddenProgressTitles.has(title)) {
      continue;
    }

    /*
     * The newest event for a logical stage replaces the older one.
     * This prevents repeated "Researching the brand", etc.
     */
    groupedProgressMap.set(title, {
      ...event,
      title,
    });
  }

  const groupedProgress = Array.from(
    groupedProgressMap.values()
  );

  const activeProgressIndex =
    running && groupedProgress.length > 0
      ? groupedProgress.length - 1
      : -1;

  /*
   * The newest logical progress event is the PRIMARY status.
   * Older events are only shown when the user expands the row.
   */
  const currentProgress =
    groupedProgress.length > 0
      ? groupedProgress[groupedProgress.length - 1]
      : null;

  const latestGenerationStatus = [...events]
    .reverse()
    .find((event) => event.status)?.status;

  const waitingForInput =
    !running && latestGenerationStatus === "needs_input";

  const generationFailed =
    !running &&
    (
      latestGenerationStatus === "failed" ||
      currentProgress?.type === "tool.failed"
    );

  const currentProgressTitle = generationFailed
    ? "Generation failed"
    : waitingForInput
      ? "Waiting for your response"
      : running
        ? selectedElementStatusLabel
          ? `Updating ${selectedElementStatusLabel}`
          : currentProgress?.title || "Preparing your request"
        : selectedElementStatusLabel
          ? `Updated ${selectedElementStatusLabel}`
          : "Website generated";

  const previousProgress = running
    ? groupedProgress.slice(0, -1)
    : groupedProgress;

  const messageEvents = (() => {
    const messages = events.filter(
      (event) => event.type === "message"
    );

    return messages.filter((event, index) => {
      if (index === 0) {
        return true;
      }

      const previous = messages[index - 1];

      return !(
        previous.role === event.role &&
        previous.title.trim() === event.title.trim() &&
        (previous.detail || "").trim() ===
          (event.detail || "").trim()
      );
    });
  })();

  /*
   * The first full-page prompt is temporarily rendered while the
   * Creative Direction step is open. As soon as the real conversation
   * contains that same user message, stop rendering the temporary copy.
   */
  const pendingPromptAlreadySubmitted =
    Boolean(pendingFullPagePrompt) &&
    messageEvents.some(
      (event) =>
        event.role === "user" &&
        event.title.trim() ===
          pendingFullPagePrompt?.trim()
    );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    messageEvents.length,
    groupedProgress.length,
    currentProgressTitle,
    showCreativeDirection,
    showLogoStage,
  ]);

  return <aside className="flex h-full w-[360px] shrink-0 flex-col bg-[#15171c]">
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
      <div className="min-w-0 flex-1">
        <div className="min-w-0">
          <strong>Build with AI</strong>

          <p className="mt-0.5 text-xs text-white/40">
            Create and refine your website
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => void resetChat()} disabled={running || resetting} aria-label="Reset AI chat" title="Reset AI chat" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"><RotateCcw size={17} className={resetting ? "animate-spin" : ""}/></button>
        <button onClick={onClose} aria-label="Close AI panel" title="Close AI panel" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
      </div>
    </div>

    <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
      <div className="flex flex-wrap gap-1.5">{(["Website", "Page", "Selected element", "Image"] as const).map(value => <button key={value} onClick={() => setContext(value)} className={`rounded-full border px-2.5 py-1 text-[11px] ${context === value ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/10 text-white/40"}`}>{value}</button>)}</div>
      {showProTips && (
        <ProTipsCarousel
          onClose={() => setShowProTips(false)}
          onSelectPrompt={(text) => { setPrompt(text); setShowProTips(false); }}
        />
      )}
      {!events.length && !pendingFullPagePrompt && !showCreativeDirection && !showLogoStage && (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-white/45">
          Describe the website, page, or focused change you want. Agent activity will appear here only after a real operation occurs.
        </div>
      )}

      {pendingFullPagePrompt &&
        !pendingPromptAlreadySubmitted && (
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

      {showLogoStage && (
        <div className="mr-2 flex justify-start">
          <div className="w-full rounded-2xl rounded-bl-md border border-white/10 bg-[#242833] p-3.5 text-white/90 shadow-md shadow-black/20">
            <div className="mb-2.5 flex items-center gap-2 text-sm font-medium">
              <ImagePlus size={15} className="text-blue-300" />
              Brand logo
            </div>
            <p className="mb-3 text-[11px] leading-4 text-white/45">
              Add your logo so BuildEZ can use it in the header, or let AI design one for you.
            </p>

            {!logoDropzoneOpen ? (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={openLogoUpload}
                  className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-100 transition hover:border-blue-300/50 hover:bg-blue-500/20"
                >
                  Upload logo
                </button>
                <button
                  type="button"
                  onClick={chooseGenerateLogo}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  Generate AI logo
                </button>
              </div>
            ) : (
              <div>
                {!logoFile ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-3 text-center transition hover:border-blue-400/40 hover:bg-white/[0.04]">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleLogoFileSelected(file);
                        event.target.value = "";
                      }}
                    />
                    <Upload size={14} className="text-white/40" />
                    <span className="text-[10px] text-white/40">PNG, JPG, or WEBP · click to browse</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-black/25">
                      {logoUploading ? (
                        <Loader2 size={14} className="animate-spin text-white/50" />
                      ) : logoPreviewUrl ? (
                        <img src={logoPreviewUrl} alt="Logo preview" className="h-full w-full object-contain" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-medium text-white/80">{logoFile.name}</div>
                      <div className="text-[10px] text-white/35">{logoUploading ? "Uploading…" : logoUrl ? "Uploaded" : ""}</div>
                    </div>
                    {!logoUploading && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        aria-label="Remove logo"
                        className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {logoError && <p role="alert" className="mt-1.5 text-[11px] text-red-300">{logoError}</p>}

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={continueAfterLogoUpload}
                    disabled={!logoUrl || logoUploading}
                    className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-100 transition hover:border-blue-300/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    disabled={logoUploading}
                    onClick={() => {
                      setLogoDropzoneOpen(false);
                      setLogoFile(null);
                      setLogoUrl("");
                      setLogoError("");
                    }}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>
                </div>
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
      {messageEvents.map((event, index) => (
        <div
          key={event.id}
          className={`flex flex-col ${
            event.role === "assistant"
              ? "mr-6 items-start"
              : "ml-8 items-end"
          }`}
        >
          <div
            className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-6 shadow-md ${
              event.role === "assistant"
                ? "rounded-bl-md border border-white/10 bg-[#242833] text-white/90 shadow-black/20"
                : "rounded-br-md bg-blue-600 text-white shadow-blue-950/30"
            }`}
          >
            {event.title}

            {event.detail && (
              <div className="mt-1 text-[11px] text-blue-100/70">
                {event.detail}
              </div>
            )}

            {event.role === "assistant" && event.showUpgrade && (
              <div className="mt-3">
                <Link
                  href="/app/workspace/billing#ai-credits"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-500/20"
                >
                  <Sparkles size={11} /> Upgrade plan
                </Link>
              </div>
            )}

            {event.role === "assistant" &&
              event.status === "needs_input" &&
              Boolean(event.actions?.length) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {event.actions?.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      disabled={running || !waitingForInput}
                      onClick={() =>
                        void onSubmit(
                          action.value,
                          mode,
                          [],
                          creativeDirection,
                          context
                        )
                      }
                      className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-100 transition hover:border-blue-300/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

            {event.role === "assistant" &&
              event.status === "completed" &&
              index === messageEvents.length - 1 &&
              !running && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      window.requestAnimationFrame(() => composerRef.current?.focus());
                    }}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                  >
                    Request a change
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-500/20"
                  >
                    <Star size={11} /> Rate this design
                  </button>
                </div>
              )}
          </div>
          <span className="mt-1 px-1 text-[10px] text-white/30">
            {formatMessageTimestamp(event.timestamp)}
          </span>
        </div>
      ))}

      {!running &&
        messageEvents.length > 0 &&
        messageEvents[messageEvents.length - 1].role === "assistant" &&
        messageEvents[messageEvents.length - 1].status === "completed" && (
          <PostGenerationCTACard siteId={siteId} />
        )}

      {(running || groupedProgress.length > 0) && (
        <div className="py-2">
          <button
            type="button"
            onClick={() =>
              setGenerationExpanded((value) => !value)
            }
            aria-expanded={generationExpanded}
            className="group flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center text-white/40 transition-colors group-hover:text-white/70">
              {generationExpanded ? (
                <ChevronDown size={15} strokeWidth={2} />
              ) : (
                <ChevronRight size={15} strokeWidth={2} />
              )}
            </span>

            <span
              className={
                running
                  ? "buildez-generation-shine min-w-0 flex-1 truncate text-[15px] font-semibold leading-6"
                  : generationFailed
                    ? "min-w-0 flex-1 truncate text-[15px] font-semibold leading-6 text-red-300"
                  : "min-w-0 flex-1 truncate text-[15px] font-semibold leading-6 text-white/90"
              }
            >
              {currentProgressTitle}
            </span>

            {running && (
              <span className="ml-2 shrink-0 font-mono text-[12px] font-medium tabular-nums text-white/45">
                {elapsedLabel}
              </span>
            )}
          </button>

          {generationExpanded && (
            <div className="ml-[30px] mt-1.5 space-y-1">
              {previousProgress.length > 0 ? (
                previousProgress.map((event) => {
                  const failed = event.type === "tool.failed";

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 py-1"
                    >
                      <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center">
                        {failed ? (
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-red-400/15 text-[10px] font-bold text-red-300">
                            !
                          </span>
                        ) : (
                          <Check
                            size={12}
                            strokeWidth={2.5}
                            className="text-emerald-300/80"
                          />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div
                          className={`text-[12px] leading-5 ${
                            failed
                              ? "text-red-200"
                              : "text-white/45"
                          }`}
                        >
                          {event.title}
                        </div>

                        {failed && event.detail && (
                          <div className="mt-0.5 text-[11px] leading-4 text-red-200/50">
                            {event.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-1 text-[12px] text-white/35">
                  {running
                      ? "Starting generation…"
                      : generationFailed
                        ? currentProgress?.detail || "The website was not changed."
                        : waitingForInput
                          ? "Generation will continue after your response."
                          : "Generation complete"}
                </div>
              )}

              {running && currentProgress?.detail && (
                <div className="ml-6 pt-1 text-[11px] leading-4 text-white/30">
                  {selectedElementStatusLabel
                    ? `Updating the selected ${selectedElementStatusLabel}`
                    : currentProgress.detail}
                </div>
              )}

              {running && elapsed >= 90 && (
                <p className="ml-6 pt-1 text-[11px] leading-4 text-white/30">
                  Complex builds can take several minutes.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div ref={conversationEndRef} aria-hidden="true" />
    </div>

    <div className="border-t border-white/10 p-3">
      {attachments.length > 0 && <div className="mb-2 grid grid-cols-2 gap-2">{attachments.map((file, index) => <AttachmentPreview key={`${file.name}-${file.lastModified}`} file={file} onRemove={() => { setAttachments(files => files.filter((_, itemIndex) => itemIndex !== index)); setAttachmentError(""); }}/>)}</div>}
      <div className="ai-glow-border rounded-xl">
        <textarea
          ref={composerRef}
          value={prompt}
          disabled={showCreativeDirection || showLogoStage}
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
            showLogoStage
              ? "Add a logo above to continue…"
              : showCreativeDirection
                ? "Complete the creative direction above…"
                : "What would you like to build or change?"
          }
          aria-describedby="ai-composer-hint"
          rows={1}
          className="block max-h-[200px] min-h-[48px] w-full resize-none overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none transition-[height] duration-150 ease-out focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>
      <p id="ai-composer-hint" className="mt-1 px-1 text-[10px] text-white/30">Enter to send · images/files 50 MB · ZIP projects up to 1 GB</p>
      {attachmentError && <p role="alert" className="mt-1 px-1 text-[11px] text-red-300">{attachmentError}</p>}
      <div className="mt-2 flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept={AI_ATTACHMENT_ACCEPT} multiple className="hidden" onChange={(event) => { selectAttachments(Array.from(event.target.files ?? [])); event.target.value = ""; }}/>
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach a design, file, or ZIP project" title="Attach files (50 MB) or one ZIP project (1 GB)" className="rounded-lg p-2 text-white/55 hover:bg-white/10"><Paperclip size={16}/></button>
        <select value={mode} onChange={(event) => setMode(event.target.value as "auto" | "discuss")} className="rounded-lg bg-white/5 px-2 py-2 text-xs"><option value="auto">Auto</option><option value="discuss">Discuss</option></select>
        <button
          type="button"
          onClick={() => setShowPromptGenerator(true)}
          aria-label="Open prompt generator"
          title="Prompt generator"
          className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white"
        >
          <Wand2 size={15} />
        </button>
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
              showLogoStage ||
              (!prompt.trim() && attachments.length === 0)
            }
            aria-label="Send message"
            title={
              showLogoStage
                ? "Add a logo above to continue"
                : showCreativeDirection
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
    <style jsx global>{`
      /*
       * BuildEZ generation shimmer.
       * This is applied ONLY to the text glyphs.
       * The row/container itself never shimmers.
       */
      .buildez-generation-shine {
        color: transparent;
        background-image: linear-gradient(
          105deg,
          rgba(255, 255, 255, 0.52) 0%,
          rgba(255, 255, 255, 0.68) 32%,
          rgba(255, 255, 255, 1) 44%,
          rgb(147, 197, 253) 50%,
          rgba(255, 255, 255, 1) 56%,
          rgba(255, 255, 255, 0.68) 68%,
          rgba(255, 255, 255, 0.52) 100%
        );
        background-size: 300% 100%;
        background-position: 150% 0;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: buildez-generation-text-shine 3s linear infinite;
      }

      @keyframes buildez-generation-text-shine {
        from {
          background-position: 150% 0;
        }

        to {
          background-position: -150% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .buildez-generation-shine {
          animation: none;
          background: none;
          color: rgba(255, 255, 255, 0.9);
          -webkit-text-fill-color: currentColor;
        }
      }
    `}</style>

    {showPromptGenerator && (
      <PromptGeneratorModal
        siteId={siteId}
        context={context}
        selectedElementLabel={selectedElementLabel}
        creativeDirection={creativeDirection}
        initialPrompt={prompt}
        onClose={() => setShowPromptGenerator(false)}
        onInsert={(text) => {
          setPrompt(text);
          setShowPromptGenerator(false);
          window.requestAnimationFrame(() => composerRef.current?.focus());
        }}
      />
    )}

    {showFeedbackModal && (
      <FeedbackModal
        siteId={siteId}
        pageId={pageId}
        onClose={() => setShowFeedbackModal(false)}
      />
    )}
  </aside>;
}

function FeedbackModal({
  siteId,
  pageId,
  onClose,
}: {
  siteId: string;
  pageId?: string;
  onClose(): void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submitFeedback() {
    if (!rating || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/sites/${siteId}/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, comment, pageId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Could not submit feedback.");
      setSubmitted(true);
      window.setTimeout(onClose, 1400);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[40000] grid place-items-center bg-black/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#15171c]/90 text-white shadow-2xl backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold">Rate this design</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center text-sm text-white/70">Thanks for the feedback!</div>
        ) : (
          <div className="space-y-4 p-5">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  className="p-0.5"
                >
                  <Star
                    size={28}
                    className={(hoverRating || rating) >= value ? "fill-amber-400 text-amber-400" : "text-white/20"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Anything you liked or want different? (optional)"
              className="h-24 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-400"
            />
            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
            <button
              onClick={() => void submitFeedback()}
              disabled={!rating || submitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit feedback"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

type PostGenerationState = {
  loading: boolean;
  creditsRemaining: number | null;
  isFreePlan: boolean;
  canUseCustomDomain: boolean;
  hasConnectedDomain: boolean;
  settingsHref: string;
};

/**
 * Shown once under the last completed generation — never mid-generation,
 * never on a failed one. Surfaces exactly one next step, in priority
 * order: out of credits blocks further generation entirely, a free plan
 * can't connect a domain at all (so upgrading is the only path), and only
 * then an unconnected domain on a plan that supports one.
 */
function PostGenerationCTACard({ siteId }: { siteId: string }) {
  const [state, setState] = useState<PostGenerationState | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/builder-v3/credits", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/sites/${siteId}/domains`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([credits, domains]) => {
      if (cancelled) return;
      const planCode = String(credits?.planCode || "").toUpperCase();
      let slug = "";
      try { slug = domains?.platformUrl ? new URL(domains.platformUrl).hostname.split(".")[0] : ""; } catch { slug = ""; }
      setState({
        loading: false,
        creditsRemaining: typeof credits?.balance?.totalRemaining === "number" ? credits.balance.totalRemaining : null,
        isFreePlan: planCode === "FREE" || planCode === "TRIAL" || planCode === "",
        canUseCustomDomain: domains?.canUseCustomDomain === true,
        hasConnectedDomain: Array.isArray(domains?.domains) && domains.domains.some((d: { status?: string }) => d.status === "VERIFIED"),
        settingsHref: slug ? `/app/${slug}/settings?tab=domains` : "/app/workspace/websites",
      });
    }).catch(() => { if (!cancelled) setState(null); });
    return () => { cancelled = true; };
  }, [siteId]);

  if (!state || state.loading) return null;

  if (state.creditsRemaining !== null && state.creditsRemaining <= 0) {
    return (
      <CTACard icon={<Zap size={15} />} tone="amber" title="AI credits exhausted"
        body="You're out of AI credits for this period. Add more to keep generating and editing."
        ctaLabel="Add credits" ctaHref="/app/workspace/billing#ai-credits" />
    );
  }
  if (state.isFreePlan) {
    return (
      <CTACard icon={<Sparkles size={15} />} tone="blue" title="Ready to launch?"
        body="Upgrade to connect your own domain, unlock more AI credits, and get the full toolkit for launching a real website."
        ctaLabel="Upgrade plan" ctaHref="/app/plans" />
    );
  }
  if (state.canUseCustomDomain && !state.hasConnectedDomain) {
    return (
      <CTACard icon={<Globe2 size={15} />} tone="emerald" title="Connect your domain"
        body="Your site is ready — connect a custom domain to make it live at your own address."
        ctaLabel="Connect domain" ctaHref={state.settingsHref} />
    );
  }
  return null;
}

function CTACard({ icon, tone, title, body, ctaLabel, ctaHref }: { icon: React.ReactNode; tone: "amber" | "blue" | "emerald"; title: string; body: string; ctaLabel: string; ctaHref: string }) {
  const toneClasses = {
    amber: { border: "border-amber-400/25", bg: "bg-amber-500/10", icon: "bg-amber-400/15 text-amber-300", button: "border-amber-400/30 bg-amber-500/10 text-amber-200 hover:border-amber-300/50 hover:bg-amber-500/20" },
    blue: { border: "border-blue-400/25", bg: "bg-blue-500/10", icon: "bg-blue-400/15 text-blue-300", button: "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:border-blue-300/50 hover:bg-blue-500/20" },
    emerald: { border: "border-emerald-400/25", bg: "bg-emerald-500/10", icon: "bg-emerald-400/15 text-emerald-300", button: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300/50 hover:bg-emerald-500/20" },
  }[tone];
  return (
    <div className={`mr-6 mt-1 flex items-start gap-3 rounded-2xl border ${toneClasses.border} ${toneClasses.bg} px-4 py-3`}>
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${toneClasses.icon}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-white/90">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-white/55">{body}</p>
        <Link href={ctaHref} className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${toneClasses.button}`}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function ProTipsCarousel({ onClose, onSelectPrompt }: { onClose(): void; onSelectPrompt(prompt: string): void }) {
  const tips = [
    {
      eyebrow: "Design to functional site",
      title: "Already have a UI design?",
      body:
        "Upload a screenshot, Figma export, UI image or PDF and BuildEZ AI can recreate the design as a production-ready functional site.",
      image: "/pro-tips/ui-to-code.webp",
      alt: "AI converting an existing UI design into website code",
      accent: "from-blue-500/20 via-sky-400/10 to-transparent",
      prompt:
        "I have a UI design I'd like turned into a working website — I'll attach a screenshot, Figma export, or PDF. Please recreate it as a responsive, production-ready site with working navigation, sections and content matching the design.",
    },
    {
      eyebrow: "Immersive experiences",
      title: "Build rich 3D & animated websites",
      body:
        "Ask for cinematic scroll experiences, parallax, shaders, WebGL, interactive product showcases, 3D scenes and advanced motion.",
      image: "/pro-tips/immersive-3d.webp",
      alt: "Interactive 3D animated website experience",
      accent: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
      prompt:
        "Build me an immersive, cinematic website with smooth scroll-triggered animations, parallax depth, subtle 3D/WebGL visuals, and an interactive product showcase section. Make it feel alive and premium, like a top design agency's site.",
    },
    {
      eyebrow: "Traditional websites",
      title: "Or keep it beautifully simple",
      body:
        "Build professional corporate, SaaS, healthcare, portfolio, commerce and landing pages with responsive layouts and polished interactions.",
      image: "/pro-tips/traditional-site.webp",
      alt: "Modern traditional business website",
      accent: "from-emerald-500/20 via-cyan-400/10 to-transparent",
      prompt:
        "Build me a clean, professional business website with a hero section, an about/services overview, a portfolio or product grid, testimonials, and a contact form. Keep the layout simple, responsive and easy to navigate.",
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

        <button
          type="button"
          onClick={() => onSelectPrompt(tip.prompt)}
          title="Use this prompt"
          className="block w-full px-4 text-left"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black/25 transition group-hover:border-white/20">
            {tips.map((item, itemIndex) => (
              <img
                key={item.image}
                src={item.image}
                alt={item.alt}
                loading="eager"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  itemIndex === index ? "opacity-100" : "opacity-0"
                }`}
                draggable={false}
              />
            ))}
          </div>
        </button>

        <div className="px-4 pb-4 pt-3">
          <button type="button" onClick={() => onSelectPrompt(tip.prompt)} className="block w-full text-left" title="Use this prompt">
            <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-blue-300/80">
              {tip.eyebrow}
            </div>

            <h3 className="mt-1 text-sm font-semibold leading-5 text-white">
              {tip.title}
            </h3>

            <p className="mt-1.5 text-[11px] leading-[1.55] text-white/50">
              {tip.body}
            </p>
          </button>

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
  const questionCount = 8;
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (step !== questionCount || completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, [step]);
  const next = () => setStep(current => Math.min(questionCount, current + 1));
  const choose = <K extends keyof CreativeDirection,>(key: K, selected: CreativeDirection[K]) => {
    onChange({ ...value, [key]: selected });
    next();
  };
  const questions = [
    <DirectionPills key="experience" label="What kind of website experience should BuildEZ create?" options={EXPERIENCE_TYPE_OPTIONS} selected={value.experienceType} onSelect={(selected) => choose("experienceType", selected)}/>,
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
      <p className="text-xs leading-5 text-white/65">{value.experienceType} · {value.designStyle} design · {value.imageStyle} imagery · {value.motionStyle.toLowerCase()} · {value.colorMood.toLowerCase()} palette · {value.density.toLowerCase()} content{value.audience ? ` · for ${value.audience}` : ""}</p>
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
