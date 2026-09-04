"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlignLeft, ArrowLeft, Blocks, Box, CalendarClock, Check, ChevronDown, ChevronsUpDown, CircleGauge,
  ClipboardList, Cloud, Code2, Columns3, Droplet, EyeOff, ExternalLink, Eye, FormInput, Grid3X3, Image as ImageIcon,
  Images, Laptop, Layers, ListChecks, Loader2, Maximize2, Megaphone, MessagesSquare,
  Moon, MoreVertical, MousePointerClick, Package, PanelRightOpen, PanelsTopLeft, Plus, Redo2, RefreshCw,
  Settings, ShoppingCart, Smartphone, Sparkles, Star, Sun, Tablet, TextCursorInput,
  Type, Undo2, Video, Wand2, X, type LucideIcon,
} from "lucide-react";

import type { BuilderV3CanvasMode } from "@/modules/builder-v3/canvas";
import { V12AgentPanel, V12CreditMeter, type V12AgentEvent } from "@/modules/builder-v3/agent-ui";
import { BUILDER_BRIDGE_VERSION, validateBuilderBridgeMessage, type BuilderSelection, type BuilderTreeNode } from "@/modules/builder-v3/visual-editor/contracts";
import { NodeToolbar } from "@/modules/builder-v3/visual-editor/NodeToolbar";
import { describeBuilderSelection } from "@/modules/builder-v3/visual-editor/selectionDescription";
import { SourceInspector } from "@/modules/builder-v3/visual-editor/SourceInspector";
import type { ElementPatch } from "@/modules/builder-v3/visual-editor/sourcePatches";
import { AIInsightsPanel } from "@/modules/builder-v3/insights";
import {
  projectManifestHasPageRoute,
  resolvePageCanvasState,
} from "@/modules/builder-v3/pageCanvasState";
import { publishedSitePath } from "@/lib/runtime/published-site-path";
import { withVerifiedDomainOverride } from "@/lib/runtime/site-live-url";
import { takePendingAttachments } from "@/modules/ai-v12/pendingAttachments";
import MediaLibrary from "@/modules/builder-v2/media/components/MediaLibrary";

type Device = "desktop" | "tablet" | "mobile";
const widths: Record<Device, string> = {
  desktop: "1200px",
  tablet: "768px",
  mobile: "390px",
};
type LeftPanel = "ai" | "insights" | "blocks" | "layers" | "media" | "colors" | "settings";
type AgentContext = "Website" | "Page" | "Selected element" | "Image";

// Sentinel prefixes for the resume/cancel action buttons synthesized onto a
// stuck-job recovery banner — recognized at the top of V12AgentPanel's
// onSubmit so they never reach the normal generate-a-prompt path.
const RESUME_JOB_PREFIX = "__resume_job__:";
const CANCEL_JOB_PREFIX = "__cancel_job__:";

function apiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" ? message : fallback;
}

type WidgetCard = { name: string; description: string; icon: LucideIcon };
type WidgetGroup = { name: string; description: string; items: WidgetCard[] };

const widgetGroups: WidgetGroup[] = [
  { name: "Basic", description: "Essential content", items: [
    { name: "Heading", description: "Section or page heading", icon: Type },
    { name: "Text", description: "Paragraph or body copy", icon: AlignLeft },
    { name: "Rich text", description: "Formatted long-form content", icon: AlignLeft },
    { name: "Button", description: "Clickable action", icon: MousePointerClick },
    { name: "Link", description: "Text or navigation link", icon: ExternalLink },
    { name: "Icon", description: "Single icon or symbol", icon: Star },
    { name: "Badge", description: "Compact label or status", icon: Sparkles },
    { name: "List", description: "Bulleted or numbered items", icon: ListChecks },
  ] },
  { name: "Media", description: "Images & video", items: [
    { name: "Image", description: "Upload or choose an image", icon: ImageIcon },
    { name: "Video", description: "Video embed or upload", icon: Video },
    { name: "Gallery", description: "Collection of images", icon: Images },
    { name: "Carousel", description: "Sliding media collection", icon: Images },
    { name: "Lightbox", description: "Expandable media viewer", icon: Maximize2 },
    { name: "Map", description: "Location or contact map", icon: PanelsTopLeft },
  ] },
  { name: "Layout", description: "Structure & spacing", items: [
    { name: "Section", description: "Page section", icon: PanelsTopLeft },
    { name: "Container", description: "Content wrapper", icon: Box },
    { name: "Row", description: "Horizontal content layout", icon: Layers },
    { name: "Columns", description: "Multi-column layout", icon: Columns3 },
    { name: "Column", description: "Single column container", icon: Columns3 },
    { name: "Grid", description: "Responsive grid layout", icon: Grid3X3 },
    { name: "Stack", description: "Vertical content layout", icon: Layers },
    { name: "Divider", description: "Visual content separator", icon: AlignLeft },
    { name: "Spacer", description: "Vertical spacing", icon: ChevronsUpDown },
  ] },
  { name: "Forms", description: "Capture information", items: [
    { name: "Form", description: "Complete input form", icon: ClipboardList },
    { name: "Input", description: "Single-line field", icon: FormInput },
    { name: "Textarea", description: "Multi-line field", icon: TextCursorInput },
    { name: "Select", description: "Dropdown field", icon: ChevronDown },
    { name: "Checkbox", description: "Multiple-choice control", icon: Check },
    { name: "Radio group", description: "Single-choice control", icon: CircleGauge },
    { name: "File upload", description: "Visitor file attachment", icon: Cloud },
    { name: "Submit button", description: "Form submission action", icon: MousePointerClick },
  ] },
  { name: "Marketing", description: "Promote & convert", items: [
    { name: "Header", description: "Site navigation header", icon: PanelsTopLeft },
    { name: "Hero", description: "Opening page section", icon: PanelsTopLeft },
    { name: "Features", description: "Product highlights", icon: ListChecks },
    { name: "Logo cloud", description: "Partner or client logos", icon: Images },
    { name: "Stats", description: "Key figures and metrics", icon: CircleGauge },
    { name: "Testimonials", description: "Customer quotes", icon: MessagesSquare },
    { name: "Team", description: "People and role cards", icon: MessagesSquare },
    { name: "Pricing", description: "Plans and feature comparison", icon: Package },
    { name: "FAQ", description: "Expandable questions", icon: ListChecks },
    { name: "Timeline", description: "Process or milestone steps", icon: Layers },
    { name: "Call to action", description: "Conversion prompt", icon: Megaphone },
    { name: "Footer", description: "Site footer and links", icon: PanelsTopLeft },
  ] },
  { name: "Commerce", description: "Sell products", items: [
    { name: "Product grid", description: "Product collection", icon: Grid3X3 },
    { name: "Product card", description: "Individual product", icon: Package },
    { name: "Collection list", description: "ShopEZ collections", icon: Layers },
    { name: "Product filters", description: "Filter and sort controls", icon: ListChecks },
    { name: "Product search", description: "Search the catalogue", icon: FormInput },
    { name: "Cart button", description: "Add item to cart", icon: ShoppingCart },
    { name: "Mini cart", description: "Compact cart summary", icon: ShoppingCart },
    { name: "Checkout button", description: "Start ShopEZ checkout", icon: MousePointerClick },
  ] },
  { name: "Dynamic", description: "Live content & feeds", items: [
    { name: "CMS collection", description: "Connected content grid", icon: Grid3X3 },
    { name: "Blog list", description: "Latest articles feed", icon: AlignLeft },
    { name: "Blog card", description: "Article preview", icon: PanelsTopLeft },
    { name: "Social feed", description: "Connected social content", icon: Images },
    { name: "Dynamic field", description: "Mapped feed value", icon: Sparkles },
  ] },
];

function GenerationArtwork() {
  return <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/55 backdrop-blur-[2px]">
    <div className="w-[360px] max-w-[80%] rounded-3xl border border-white/15 bg-[#111827]/95 p-6 text-center text-white shadow-2xl">
      <div className="relative mx-auto h-36 w-60">
        <div className="absolute left-2 top-6 h-24 w-20 -rotate-6 rounded-lg border border-white/15 bg-white/10 shadow-xl animate-[builder-artboard-left_3.2s_ease-in-out_infinite]"><div className="h-7 rounded-t-lg bg-blue-500/70"/><div className="m-2 h-2 rounded bg-white/30"/><div className="m-2 h-8 rounded bg-white/10"/></div>
        <div className="absolute left-1/2 top-1 z-10 h-32 w-24 -translate-x-1/2 rounded-lg border border-blue-300/30 bg-white shadow-2xl animate-[builder-artboard-center_2.8s_ease-in-out_infinite]"><div className="m-2 h-12 rounded bg-gradient-to-br from-blue-900 to-blue-500"/><div className="mx-2 grid grid-cols-2 gap-1"><i className="h-7 rounded bg-blue-50"/><i className="h-7 rounded bg-slate-100"/></div><div className="m-2 h-3 rounded bg-blue-600"/></div>
        <div className="absolute right-2 top-7 h-24 w-20 rotate-6 rounded-lg border border-white/15 bg-white/10 shadow-xl animate-[builder-artboard-right_3.4s_ease-in-out_infinite]"><div className="m-2 h-2 rounded bg-white/35"/><div className="m-2 h-10 rounded bg-amber-200/30"/><div className="m-2 h-2 rounded bg-white/15"/></div>
      </div>
      <div className="flex items-center justify-center gap-2 font-semibold"><Sparkles size={18} className="animate-pulse text-blue-300"/>Building your website</div>
      <p className="mt-2 text-xs text-white/50">Designing, coding and checking every responsive detail</p>
      <div className="mx-auto mt-4 h-1 max-w-52 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/3 animate-[ai-agent-progress_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-sky-300 to-blue-500"/></div>
    </div>
  </div>;
}

function BlankCanvasGreeting({ onAI, onBlocks }: { onAI(): void; onBlocks(): void }) {
  return <div className="absolute inset-0 z-20 grid place-items-center bg-[#f8fafc] text-slate-900">
    <div className="w-full max-w-xl px-8 text-center">
      <div className="relative mx-auto mb-8 h-36 w-52">
        <div className="absolute left-5 top-3 h-28 w-40 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><div className="flex gap-1"><i className="h-2 w-2 rounded-full bg-blue-500"/><i className="h-2 w-2 rounded-full bg-sky-300"/></div><div className="mt-3 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-sky-400"/><div className="mt-3 grid grid-cols-3 gap-2"><i className="h-10 rounded bg-blue-50"/><i className="h-10 rounded bg-slate-100"/><i className="h-10 rounded bg-sky-50"/></div></div>
        <div className="absolute bottom-0 right-0 grid h-16 w-16 place-items-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-lg"><Blocks size={25}/></div>
        <div className="absolute -left-1 bottom-2 grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300"><Sparkles size={20}/></div>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight">What do you want to build today?</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Describe your idea or start with familiar widgets. You can switch between AI and manual editing at any time.</p>
      <div className="mt-7 flex justify-center gap-3"><button onClick={onAI} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500"><Sparkles size={16}/>Build with AI</button><button onClick={onBlocks} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><Blocks size={16}/>Browse blocks</button></div>
    </div>
  </div>;
}

type BuilderPage = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
  faviconUrl: string;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  customCss: string;
  customJs: string;
};

type Builder3CanvasProps = {
  siteId: string;
  siteName: string;
  siteSlug: string;
  verifiedDomain?: string | null;
  page?: BuilderPage;
  initialPanel?: LeftPanel;
  initialPrompt?: string;
  initialContext?: AgentContext;
  initialAutoSubmit?: boolean;
};

export default function Builder3Canvas({
  siteId,
  siteName,
  siteSlug,
  verifiedDomain,
  page,
  initialPanel,
  initialPrompt = "",
  initialContext = "Website",
  initialAutoSubmit = false,
}: Builder3CanvasProps) {
  const router = useRouter();
  const [mode, setMode] = useState<BuilderV3CanvasMode>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [builderOrigin, setBuilderOrigin] = useState("");
  const [previewSessionId, setPreviewSessionId] = useState<string>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selection, setSelection] = useState<BuilderSelection>();
  const [initialAttachments] = useState<File[]>(() => takePendingAttachments());
  const [elementTree, setElementTree] = useState<BuilderTreeNode[] | null>(null);
  const [error, setError] = useState<string>();
  const [workspace, setWorkspace] = useState<{
    revision?: number;
    files?: Array<{
      path?: string;
      content?: string;
    }>;
    pageManifest?: unknown;
  }>();
  const [workspaceError, setWorkspaceError] = useState<string>();
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [agentEvents, setAgentEvents] = useState<V12AgentEvent[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [insightPrompt, setInsightPrompt] = useState("");
  const [insightContext, setInsightContext] = useState<AgentContext>("Page");
  const [previewGeneration, setPreviewGeneration] = useState(0);
  const agentAbortRef = useRef<AbortController | null>(null);
  const [leftPanel, setLeftPanel] = useState<LeftPanel | null>(
    initialPanel ?? "ai",
  );
  const [zoom, setZoom] = useState(100);
  const [darkCanvas, setDarkCanvas] = useState(true);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pageStatus, setPageStatus] = useState<"DRAFT" | "PUBLISHED">(page?.status ?? "DRAFT");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishResult, setPublishResult] = useState<{ status: "success" | "failure"; message: string; url?: string } | null>(null);
  const [kebabMenuOpen, setKebabMenuOpen] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(page?.publishedAt ?? null);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string | null>(page?.scheduledPublishAt ?? null);
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customCss, setCustomCss] = useState(page?.customCss ?? "");
  const [customJs, setCustomJs] = useState(page?.customJs ?? "");
  const [savingCustomCode, setSavingCustomCode] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [toast, setToast] = useState<{ message: string; href?: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, href?: string) => {
    setToast({ message, href });
    setToastVisible(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 5000);
  }, []);

  useEffect(() => {
    if (toastVisible || !toast) return;
    const timer = window.setTimeout(() => setToast(null), 300);
    return () => window.clearTimeout(timer);
  }, [toastVisible, toast]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => setBuilderOrigin(window.location.origin), []);

  useEffect(() => {
    let cancelled = false;
    setHistoryReady(false);

    async function loadAgentHistory() {
      try {
        const params = new URLSearchParams({
          siteId,
        });

        if (page?.id) {
          params.set("pageId", page.id);
        }

        const response = await fetch(
          `/api/builder-v3/agent/history?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        const payload = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            apiErrorMessage(
              payload,
              "The AI chat history could not be loaded.",
            ),
          );
        }

        const rawEvents =
          payload?.data?.events;

        if (
          cancelled ||
          !Array.isArray(rawEvents)
        ) {
          return;
        }

        const history: V12AgentEvent[] =
          rawEvents
            .filter(
              (event: unknown) =>
                event &&
                typeof event === "object",
            )
            .map(
              (event: any): V12AgentEvent => ({
                id:
                  typeof event.id === "string"
                    ? event.id
                    : crypto.randomUUID(),

                type: "message",

                role:
                  event.role === "assistant"
                    ? "assistant"
                    : "user",

                title:
                  typeof event.title === "string"
                    ? event.title
                    : "",

                detail:
                  typeof event.detail === "string"
                    ? event.detail
                    : undefined,

                timestamp:
                  typeof event.timestamp === "string"
                    ? event.timestamp
                    : new Date().toISOString(),
              }),
            );

        setAgentEvents((current) => {
          // During builder startup page resolution can cause the history
          // request to run again. Never allow a later empty response to
          // erase a conversation that has already been hydrated.
          if (history.length === 0 && current.length > 0) {
            console.log(
              "[AI history] Ignoring empty history response because chat is already hydrated",
              {
                siteId,
                pageId: page?.id,
                currentEvents: current.length,
              },
            );

            return current;
          }

          console.log(
            "[AI history] Hydrated conversation",
            {
              siteId,
              pageId: page?.id,
              events: history.length,
            },
          );

          return history;
        });
      } catch (reason) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load AI chat history",
          reason,
        );
      } finally {
        if (!cancelled) setHistoryReady(true);
      }
    }

    void loadAgentHistory();

    return () => {
      cancelled = true;
    };
  }, [siteId, page?.id]);

  /*
   * Recovers from a page reload/reconnect that lost track of a generation:
   * a job left "running"/"stage_complete" by a server restart or a closed
   * tab, or one that finished/failed while nobody was watching the live
   * stream. Runs only after history hydration settles (historyReady) so it
   * can reliably tell whether the persisted conversation already ends with
   * an assistant reply, rather than racing that fetch.
   */
  useEffect(() => {
    if (!historyReady) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/builder-v3/agent/run?siteId=${encodeURIComponent(siteId)}`, { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (cancelled || !response.ok || !payload?.job) return;
        const job = payload.job as {
          id: string;
          stage: "plan" | "generate";
          status: "running" | "stage_complete" | "done" | "failed" | "needs_input";
          updatedAt: string;
          stale: boolean;
          error?: string | null;
          result?: { message: string; status?: "needs_input" | "completed"; actions?: V12AgentEvent["actions"] } | null;
        };

        if (job.status === "running" || job.status === "stage_complete") {
          if (job.stale) {
            fetch(`/api/builder-v3/agent/run?jobId=${encodeURIComponent(job.id)}`, { method: "DELETE" }).catch(() => {});
            setAgentEvents(events => [...events, {
              id: crypto.randomUUID(),
              type: "tool.failed",
              title: "Build was interrupted",
              detail: "A previous generation didn't finish — likely a server restart. Send a new prompt to try again.",
              timestamp: new Date().toISOString(),
            }]);
            return;
          }
          setAgentEvents(events => [...events, {
            id: crypto.randomUUID(),
            type: "message",
            role: "assistant",
            title: "A generation from an earlier session is still marked in progress.",
            detail: "Resume it if it's still running, or cancel it to start a fresh prompt.",
            status: "needs_input",
            actions: [
              ...(job.stage === "generate" && job.status === "stage_complete"
                ? [{ id: "resume", label: "Resume generation", value: `${RESUME_JOB_PREFIX}${job.id}` }]
                : []),
              { id: "cancel", label: "Cancel and start over", value: `${CANCEL_JOB_PREFIX}${job.id}` },
            ],
            timestamp: new Date().toISOString(),
          }]);
          return;
        }

        // Terminal job: back-fill its outcome only if the persisted
        // conversation ends with the user's prompt and no assistant reply —
        // exactly the "refresh only shows the prompt" gap this closes.
        setAgentEvents(events => {
          const last = events[events.length - 1];
          if (!last || last.role !== "user") return events;
          if (job.status === "failed") {
            return [...events, {
              id: crypto.randomUUID(),
              type: "tool.failed",
              title: "Build stopped",
              detail: job.error || "Generation failed.",
              timestamp: new Date().toISOString(),
            }];
          }
          if (job.result) {
            return [...events, {
              id: crypto.randomUUID(),
              type: "message",
              role: "assistant",
              title: job.result.message,
              status: job.result.status ?? "completed",
              actions: job.result.actions,
              timestamp: new Date().toISOString(),
            }];
          }
          return events;
        });
      } catch {
        // Best-effort recovery only — never block the builder on this.
      }
    })();
    return () => { cancelled = true; };
  }, [siteId, historyReady]);

  async function resumeStuckJob(jobId: string) {
    const controller = new AbortController();
    agentAbortRef.current = controller;
    setAgentRunning(true);
    try {
      let nextForm: FormData | null = new FormData();
      nextForm.set("siteId", siteId);
      nextForm.set("jobId", jobId);
      let completed = false;
      while (nextForm) {
        const requestForm = nextForm;
        nextForm = null;
        const response = await fetch("/api/builder-v3/agent/run", { method: "POST", body: requestForm, signal: controller.signal });
        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(apiErrorMessage(payload, "Could not resume the generation."));
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffered = "";
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffered += decoder.decode(chunk.value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as {
              type: string;
              title?: string;
              detail?: string;
              role?: "assistant";
              revision?: number;
              status?: "needs_input" | "completed" | "failed";
              actions?: V12AgentEvent["actions"];
              jobId?: string;
            };
            if (event.type === "stage.complete" && event.jobId) {
              const resumeForm = new FormData();
              resumeForm.set("siteId", siteId);
              resumeForm.set("jobId", event.jobId);
              nextForm = resumeForm;
              continue;
            }
            if (event.type === "done") {
              completed = event.status === "completed";
              setAgentEvents(events => [...events, {
                id: crypto.randomUUID(),
                type: event.status === "failed" ? "tool.failed" : "tool.completed",
                title: event.status === "needs_input" ? "Waiting for your response" : event.status === "failed" ? "Generation failed" : "Generation complete",
                detail: event.status === "needs_input" ? "Generation will continue after your response." : undefined,
                status: event.status,
                timestamp: new Date().toISOString(),
              }]);
              continue;
            }
            if (event.type === "preview.updated") {
              setWorkspace(current => ({ ...current, revision: event.revision ?? current?.revision }));
              setPreviewGeneration(value => value + 1);
              setAgentEvents(events => [...events, {
                id: crypto.randomUUID(),
                type: "tool.completed",
                title: event.title || "Canvas updated",
                detail: event.detail,
                timestamp: new Date().toISOString(),
              }]);
              continue;
            }
            if (["message", "tool.started", "tool.completed", "tool.failed"].includes(event.type)) {
              setAgentEvents(events => [...events, {
                id: crypto.randomUUID(),
                type: event.type as V12AgentEvent["type"],
                role: event.role,
                title: event.title || "Agent update",
                detail: event.detail,
                status: event.status,
                actions: event.actions,
                timestamp: new Date().toISOString(),
              }]);
            }
          }
        }
      }
      if (completed) {
        const treeResponse = await fetch(`/api/builder-v3/projects/${siteId}/tree?refresh=${Date.now()}`, { cache: "no-store" });
        if (treeResponse.ok) {
          const treePayload = await treeResponse.json();
          const normalized = treePayload?.data && typeof treePayload.data === "object" ? treePayload.data : treePayload;
          setWorkspace({
            revision: normalized?.revision,
            files: Array.isArray(normalized?.files) ? normalized.files : [],
            pageManifest: normalized?.pageManifest ?? null,
          });
        }
      }
    } catch (reason) {
      setAgentEvents(events => [...events, {
        id: crypto.randomUUID(),
        type: "tool.failed",
        title: "Resume failed",
        detail: reason instanceof Error ? reason.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      if (agentAbortRef.current === controller) agentAbortRef.current = null;
      setAgentRunning(false);
    }
  }

  async function cancelStuckJob(jobId: string) {
    try {
      await fetch(`/api/builder-v3/agent/run?jobId=${encodeURIComponent(jobId)}`, { method: "DELETE" });
      setAgentEvents(events => [...events, {
        id: crypto.randomUUID(),
        type: "tool.completed",
        title: "Generation cancelled",
        detail: "You can start a new prompt now.",
        timestamp: new Date().toISOString(),
      }]);
    } catch (reason) {
      setAgentEvents(events => [...events, {
        id: crypto.randomUUID(),
        type: "tool.failed",
        title: "Could not cancel",
        detail: reason instanceof Error ? reason.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }]);
    }
  }

  async function checkpoint(label: string) {
    const response = await fetch(`/api/builder-v3/projects/${siteId}/checkpoints`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ label }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not save checkpoint"));
    const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    if (typeof data?.checkpointId !== "string") throw new Error("Invalid checkpoint response");
    return data.checkpointId as string;
  }

  async function saveNow() {
    if (!workspace?.revision || saving) return;
    setSaving(true);
    try { await checkpoint("Manual save"); setSavedAt(new Date()); showToast("Changes saved"); }
    catch (reason) { setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Save failed", detail: reason instanceof Error ? reason.message : "Could not save", timestamp: new Date().toISOString() }]); }
    finally { setSaving(false); }
  }

  async function publishNow() {
    if (!page?.id || publishing || saving) return;
    setPublishing(true);
    setPublishResult(null);
    try {
      await checkpoint("Before publish");
      const response = await fetch(`/api/pages/${page.id}/publish`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not publish page"));
      const publicUrl = canonicalPageUrl
        ?? withVerifiedDomainOverride(`${window.location.origin}${publishedSitePath(siteSlug, page.slug)}`, verifiedDomain, page.slug);
      setPageStatus("PUBLISHED");
      setPublishedAt(new Date().toISOString());
      setScheduledPublishAt(null);
      showToast("Page published", publicUrl);
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.completed", title: "Page published", detail: `${page.title} is now live`, timestamp: new Date().toISOString() }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not publish page";
      setPublishResult({ status: "failure", message });
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Publish failed", detail: message, timestamp: new Date().toISOString() }]);
    } finally { setPublishing(false); }
  }

  async function unpublishNow() {
    if (!page?.id || unpublishing) return;
    setUnpublishing(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/unpublish`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not unpublish page"));
      setPageStatus("DRAFT");
      setKebabMenuOpen(false);
      showToast("Page unpublished");
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.completed", title: "Page unpublished", detail: `${page.title} is now a draft`, timestamp: new Date().toISOString() }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not unpublish page";
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Unpublish failed", detail: message, timestamp: new Date().toISOString() }]);
    } finally { setUnpublishing(false); }
  }

  async function saveCustomCode() {
    if (!page?.id || savingCustomCode) return;
    setSavingCustomCode(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/custom-code`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customCss, customJs }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not save custom code"));
      setShowCustomCodeModal(false);
      showToast("Custom code saved");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not save custom code";
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Custom code not saved", detail: message, timestamp: new Date().toISOString() }]);
    } finally { setSavingCustomCode(false); }
  }

  async function saveSchedule(dateTimeLocal: string) {
    if (!page?.id || savingSchedule || !dateTimeLocal) return;
    setSavingSchedule(true);
    try {
      const scheduledIso = new Date(dateTimeLocal).toISOString();
      const response = await fetch(`/api/pages/${page.id}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scheduledPublishAt: scheduledIso }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not schedule publish"));
      setScheduledPublishAt(scheduledIso);
      setShowScheduleModal(false);
      showToast(`Publish scheduled for ${new Date(scheduledIso).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true })}`);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not schedule publish";
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Schedule not saved", detail: message, timestamp: new Date().toISOString() }]);
    } finally { setSavingSchedule(false); }
  }

  async function cancelSchedule() {
    if (!page?.id || savingSchedule) return;
    setSavingSchedule(true);
    try {
      const response = await fetch(`/api/pages/${page.id}/schedule`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Could not cancel schedule"));
      setScheduledPublishAt(null);
      showToast("Scheduled publish cancelled");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not cancel schedule";
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Cancel failed", detail: message, timestamp: new Date().toISOString() }]);
    } finally { setSavingSchedule(false); }
  }

  async function restoreHistory(direction: "undo" | "redo") {
    const source = direction === "undo" ? undoStack : redoStack;
    const targetId = source.at(-1);
    if (!targetId || workspace?.revision === undefined) return;
    setSaving(true);
    try {
      const currentId = await checkpoint(`Before ${direction}`);
      const response = await fetch(`/api/builder-v3/projects/${siteId}/checkpoints`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ checkpointId: targetId, expectedRevision: workspace.revision }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, `${direction} failed`));
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      setWorkspace(current => ({ ...current, revision: data?.revision }));
      if (direction === "undo") { setUndoStack(items => items.slice(0, -1)); setRedoStack(items => [...items, currentId]); }
      else { setRedoStack(items => items.slice(0, -1)); setUndoStack(items => [...items, currentId]); }
      /*
       * The restored canonical snapshot is already mirrored into the
       * active preview by restoreProjectCheckpoint().
       * Keep the iframe mounted and let Vite HMR update it.
      */
      setSelection(undefined);
      sendCanvas("BUILDEZ_SELECTION_CLEARED");
      setSavedAt(new Date());
    } catch (reason) {
      setAgentEvents(events => [...events, {
        id: crypto.randomUUID(),
        type: "tool.failed",
        title: `${direction === "undo" ? "Undo" : "Redo"} failed`,
        detail: reason instanceof Error ? reason.message : "Project history could not be restored",
        timestamp: new Date().toISOString(),
      }]);
    } finally { setSaving(false); }
  }

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || "")) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      void restoreHistory(event.shiftKey ? "redo" : "undo");
    };
    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [redoStack, saving, undoStack, workspace?.revision]);

  function fitCanvas() {
    const base =
      device === "mobile"
        ? 390
        : device === "tablet"
          ? 768
          : 1200;

    const availableWidth =
      window.innerWidth -
      (leftPanel ? 420 : 60) -
      (inspectorCollapsed ? 0 : 360) -
      96;

    setZoom(
      Math.max(
        50,
        Math.min(
          100,
          Math.floor((Math.max(320, availableWidth) / base) * 100)
        )
      )
    );
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  useEffect(() => {
    let disposed = false;
    let createdSessionId: string | undefined;
    setError(undefined);
    fetch("/api/builder-v3/preview/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, restart: previewGeneration > 0 }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(payload, "Preview failed to start"));
        const preview = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        if (typeof preview?.sessionId !== "string" || typeof preview?.url !== "string") throw new Error("Preview server returned an invalid session.");
        createdSessionId = preview.sessionId;
        if (!disposed) { setPreviewUrl(preview.url); setPreviewSessionId(preview.sessionId); }
      })
      .catch((reason) => { if (!disposed) setError(reason instanceof Error ? reason.message : "Preview failed to start"); });
    return () => {
      /*
       * Do not DELETE the preview session from effect cleanup.
       *
       * React development/Strict Mode may run setup -> cleanup -> setup
       * while the builder is still mounted. Deleting here can invalidate
       * the exact session embedded in __buildez_editor.js and break the
       * parent/iframe visual-editor bridge.
       *
       * PreviewSessionManager already owns replacement/restart cleanup.
       */
      disposed = true;
    };
  }, [siteId, previewGeneration]);

  useEffect(() => {
    if (!previewSessionId || !previewUrl) return;
    const previewOrigin = new URL(previewUrl).origin;
    const receive = (event: MessageEvent) => {
      if (event.origin !== previewOrigin || event.source !== iframeRef.current?.contentWindow) return;
      if (!validateBuilderBridgeMessage(event.data, { sessionId: previewSessionId, direction: "to-builder" })) return;
      if (event.data.type === "BUILDEZ_PREVIEW_READY") {
        setError(undefined);
        setAgentEvents((events) => events.filter(
          (event) => !(
            event.type === "tool.failed" &&
            event.title === "Preview render failed"
          ),
        ));
        /*
         * Treat preview.ready as the bridge handshake. The iframe load event
         * can race the injected editor listener during startup/HMR, so confirm
         * the current mode once the runtime says it is listening.
         */
        sendCanvas("BUILDEZ_EDIT_MODE_CHANGED", { mode });
      }
      if (event.data.type === "BUILDEZ_RUNTIME_ERROR") {
        const payload = event.data.payload as { message?: unknown; source?: unknown };
        const message = typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : "The generated page stopped while rendering.";
        setError(message);
        setAgentEvents(events => events.some(event => event.type === "tool.failed" && event.detail === message)
          ? events
          : [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Preview render failed", detail: message, timestamp: new Date().toISOString() }]);
      }
      if (event.data.type === "BUILDEZ_ELEMENT_SELECTED") setSelection(event.data.payload as BuilderSelection);
      if (event.data.type === "BUILDEZ_ELEMENT_BOUNDS_CHANGED") {
        const next = event.data.payload as BuilderSelection;
        setSelection(current => current?.elementId === next.elementId && current.textSelection && !next.textSelection
          ? { ...next, textSelection: current.textSelection }
          : next);
      }
      if (event.data.type === "BUILDEZ_SELECTION_CLEARED") setSelection(undefined);
      if (event.data.type === "BUILDEZ_TREE_DATA") {
        const payload = event.data.payload as { elements?: BuilderTreeNode[] };
        setElementTree(Array.isArray(payload?.elements) ? payload.elements : []);
      }
      if (event.data.type === "BUILDEZ_INLINE_EDIT_COMMITTED") {
        const payload = event.data.payload as BuilderSelection & { value?: string };
        if (typeof payload.value === "string") void applyElementPatch(payload, { operation: "text", value: payload.value });
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [mode, previewSessionId, previewUrl, workspace?.revision]);

  function sendCanvas(type: string, payload: unknown = {}) {
    if (!previewSessionId || !previewUrl) return;
    iframeRef.current?.contentWindow?.postMessage({ version: BUILDER_BRIDGE_VERSION, sessionId: previewSessionId, type, payload }, new URL(previewUrl).origin);
  }

  useEffect(() => {
    if (leftPanel !== "layers" || !previewSessionId || !previewUrl) return;
    sendCanvas("BUILDEZ_REQUEST_TREE");
  }, [leftPanel, previewSessionId, previewUrl]);

  const pagePreviewUrl = (() => {
    if (!previewUrl) return undefined;

    const url = new URL(previewUrl);
    // previewUrl's pathname is "/_v3preview/<port>" — the prefix nginx
    // strips to route into the live Vite dev server (see
    // PreviewSessionManager.ts). The page slug must be APPENDED to it,
    // never replace it, or the request falls through to the Next.js
    // app's own router instead of the tenant's live preview and 404s.
    const basePath = url.pathname.replace(/\/+$/, "");

    if (page?.slug && page.slug !== "home") {
      url.pathname = `${basePath}/${page.slug.replace(/^\/+|\/+$/g, "")}`;
    } else {
      url.pathname = basePath;
    }

    return url.toString().replace(/\/$/, "");
  })();

  const canonicalPageUrl = page?.slug && builderOrigin
    ? withVerifiedDomainOverride(`${builderOrigin}${publishedSitePath(siteSlug, page.slug)}`, verifiedDomain, page.slug)
    : undefined;

  const iframeUrl =
    pagePreviewUrl && builderOrigin
      ? `${pagePreviewUrl}${
          pagePreviewUrl.includes("?") ? "&" : "?"
        }__buildez_parent_origin=${encodeURIComponent(
          builderOrigin
        )}&__buildez_refresh=${previewGeneration}`
      : pagePreviewUrl;

  const selectedPageHasProjectRoute = (() => {
    if (!workspace) return false;
    return projectManifestHasPageRoute(workspace.pageManifest, page?.slug);
  })();

  const pageCanvasState = resolvePageCanvasState({
    workspaceLoaded,
    workspaceError,
    pageId: page?.id,
    hasProjectRoute: selectedPageHasProjectRoute,
    agentRunning,
  });

  const showBlankPageState = pageCanvasState !== "page";
  const showCanvasGeneration =
    pageCanvasState === "generating" ||
    (agentRunning && !previewUrl);
  const showCanvasGreeting =
    !showCanvasGeneration &&
    (
      pageCanvasState === "blank" ||
      (
        !previewUrl &&
        !error &&
        workspaceLoaded &&
        !agentRunning &&
        !workspaceError &&
        (workspace?.files?.length ?? 0) === 0
      ) ||
      (
        Boolean(previewUrl) &&
        !agentRunning &&
        Boolean(workspace) &&
        (workspace?.files?.length ?? 0) === 0
      )
    );

  useEffect(() => {
    sendCanvas("BUILDEZ_EDIT_MODE_CHANGED", { mode });
    if (mode === "preview") setSelection(undefined);
  }, [mode, previewSessionId, previewUrl]);

  async function applyElementPatch(target: BuilderSelection, patch: ElementPatch) {
    if (workspace?.revision === undefined) return;
    setSaving(true);
    try {
      const before = await checkpoint(`Before ${patch.operation} edit`);
      const response = await fetch(`/api/builder-v3/projects/${siteId}/element`, {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceFile: target.sourceFile, sourceAnchor: target.sourceAnchor, expectedRevision: workspace.revision, patch }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(payload, "Element edit failed"));
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      setUndoStack(items => [...items, before]);
      setRedoStack([]);

      setWorkspace(current => ({
        ...current,
        revision: data.revision,
      }));

      /*
       * Element inspector edits mutate one source file.
       * Keep the existing iframe alive and let Vite HMR apply
       * the source change so scroll position and selection context
       * are not destroyed by a complete preview remount.
       */
      setSavedAt(new Date());
    } catch (reason) {
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Source edit failed", detail: reason instanceof Error ? reason.message : "Unknown error", timestamp: new Date().toISOString() }]);
    } finally { setSaving(false); }
  }

  function handleNodeAction(action: string) {
    if (!selection) return;
    if (action === "parent") sendCanvas("BUILDEZ_REQUEST_PARENT_SELECTION");
    else if (action === "source") setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.completed", title: `Source: ${selection.sourceFile}`, detail: `Anchor ${selection.sourceAnchor}`, timestamp: new Date().toISOString() }]);
    else if (action === "ai" || action === "image") {
      const description = describeBuilderSelection(selection);
      setLeftPanel("ai");
      setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "message", role: "assistant", title: action === "image" ? `Describe the image you want for ${description.title}.` : `Editing ${description.title}`, detail: `${description.type} selected`, timestamp: new Date().toISOString() }]);
    }
  }

  useEffect(() => {
    fetch(`/api/builder-v3/projects/${siteId}/tree`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(payload, "Workspace connection failed"));
        const normalized = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setWorkspace({
          revision: normalized?.revision,
          files: Array.isArray(normalized?.files) ? normalized.files : [],
          pageManifest: normalized?.pageManifest ?? null,
        });
        setWorkspaceLoaded(true);
      })
      .catch((reason) => { setWorkspaceError(reason instanceof Error ? reason.message : "Workspace connection failed"); setWorkspaceLoaded(true); });
  }, [siteId]);

  useEffect(() => {
    fetch(`/api/builder-v3/projects/${siteId}/checkpoints`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(apiErrorMessage(payload, "History could not be loaded"));
        const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        const checkpoints = Array.isArray(data?.checkpoints) ? data.checkpoints : [];
        const seenRevisions = new Set<number>();
        const undoable = checkpoints
          .filter((checkpoint: unknown): checkpoint is { id: string; label: string; revision: number } => {
            if (!checkpoint || typeof checkpoint !== "object") return false;
            const value = checkpoint as { id?: unknown; label?: unknown; revision?: unknown };
            if (typeof value.id !== "string" || typeof value.label !== "string" || typeof value.revision !== "number" || !/^Before (?!undo$|redo$|publish$)/i.test(value.label)) return false;
            if (seenRevisions.has(value.revision)) return false;
            seenRevisions.add(value.revision);
            return true;
          })
          .map((checkpoint: { id: string }) => checkpoint.id)
          .reverse();
        setUndoStack(current => current.length ? current : undoable);
      })
      .catch(() => {
        // History hydration is a convenience; live editing remains available.
      });
  }, [siteId]);

  const canvasLeftOffset = leftPanel ? 420 : 60;
  const canvasRightOffset = inspectorCollapsed ? 0 : 360;

  const canvasViewportLeft = leftPanel ? 420 : 60;
  const canvasViewportRight = inspectorCollapsed ? 0 : 360;

  return (
    <main className="flex min-h-screen flex-col bg-[#111318] text-white">
      <header className="builder-chrome relative z-[30000] flex h-[56px] shrink-0 items-center overflow-visible border-b border-white/10 bg-[#0b0d12] px-6 backdrop-blur-xl">
        <div className="flex w-[420px] min-w-0 items-center gap-3">
          <button onClick={() => router.push(`/app/${siteSlug}/pages`)} aria-label="Back to pages" className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><ArrowLeft size={20}/></button>
          <Image src="/buildez-logo-dark.svg" alt="BuildEzy" width={118} height={39} priority className="mt-1 h-9 w-auto"/>
          <div className="relative"><button onClick={() => setSiteMenuOpen(open => !open)} className="ml-2 flex min-w-0 items-center gap-1.5 text-sm font-medium text-white/85 transition hover:text-white"><span className="max-w-[145px] truncate">{page?.title || "Untitled page"}</span><ChevronDown size={14} className={`text-white/40 transition ${siteMenuOpen ? "rotate-180" : ""}`}/></button>{siteMenuOpen && <div className="absolute left-2 top-full z-[20000] mt-4 w-56 rounded-xl border border-white/10 bg-[#0b0d12] p-2 shadow-2xl"><div className="truncate border-b border-white/10 px-3 pb-2 text-xs text-white/40">{siteName}</div><button onClick={() => router.push(`/app/${siteSlug}/pages`)} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white">All pages</button><button onClick={() => { setSiteMenuOpen(false); setLeftPanel("settings"); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white">Page settings</button></div>}</div>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${pageStatus === "PUBLISHED" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-blue-500/20 bg-blue-500/10 text-blue-400"}`}>{pageStatus === "PUBLISHED" ? "Published" : "Draft"}</span>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          {(["desktop", "tablet", "mobile"] as const).map((value) => {
            const Icon = value === "desktop" ? Laptop : value === "tablet" ? Tablet : Smartphone;
            return <button key={value} onClick={() => setDevice(value)} aria-label={`${value} viewport`} className={`rounded-xl p-2 ${device === value ? "bg-blue-500/25 text-blue-400" : "text-white/50 hover:bg-white/10"}`}><Icon size={18}/></button>;
          })}
          <select aria-label="Builder zoom" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="rounded-xl border border-white/10 bg-white/[0.08] px-2 py-1 text-sm"><option value={100}>100%</option><option value={90}>90%</option><option value={80}>80%</option><option value={70}>70%</option><option value={60}>60%</option><option value={50}>50%</option></select>
          <button onClick={fitCanvas} onDoubleClick={() => void toggleFullscreen()} aria-label="Fit canvas; double-click for fullscreen" title="Fit canvas · Double-click for fullscreen" className="rounded-xl bg-white/[0.08] p-2 transition hover:bg-white/10"><Maximize2 size={16}/></button>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => void restoreHistory("undo")} disabled={!undoStack.length || saving} aria-label="Undo" className="rounded-xl bg-white/[0.08] p-2 text-white/70 disabled:opacity-30"><Undo2 size={16}/></button>
          <button onClick={() => void restoreHistory("redo")} disabled={!redoStack.length || saving} aria-label="Redo" className="rounded-xl bg-white/[0.08] p-2 text-white/70 disabled:opacity-30"><Redo2 size={16}/></button>
          <button onClick={() => setDarkCanvas(value => !value)} aria-label="Toggle canvas theme" className="rounded-xl bg-white/[0.08] p-2 text-white/70">{darkCanvas ? <Sun size={16}/> : <Moon size={16}/>}</button>
          <div className="flex rounded-xl border border-white/10 bg-white/[0.06] p-0.5" aria-label="Canvas mode">
            <button onClick={() => setMode("edit")} className={`rounded-[9px] px-3 py-1.5 text-sm transition ${mode === "edit" ? "bg-blue-500/25 text-blue-300 shadow-sm" : "text-white/55 hover:text-white"}`}>Edit</button>
            <button onClick={() => setMode("preview")} className={`flex items-center gap-1.5 rounded-[9px] px-3 py-1.5 text-sm transition ${mode === "preview" ? "bg-blue-500/25 text-blue-300 shadow-sm" : "text-white/55 hover:text-white"}`}><Eye size={15}/>Preview</button>
          </div>
          <V12CreditMeter running={agentRunning} />
          <button onClick={() => void saveNow()} disabled={!workspace?.revision || saving} className="whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.08] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40">{saving ? <Loader2 size={16} className="mx-auto animate-spin"/> : "Save"}</button>
          <button onClick={() => void publishNow()} disabled={!page?.id || publishing || saving} className="whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40">{publishing ? "Publishing…" : pageStatus === "PUBLISHED" ? "Republish" : "Publish"}</button>
          <div className="relative">
            <button
              onClick={() => setKebabMenuOpen(open => !open)}
              disabled={!page?.id}
              aria-label="More publish options"
              aria-expanded={kebabMenuOpen}
              className="rounded-xl bg-white/[0.08] p-2 text-white/70 hover:bg-white/[0.12] disabled:opacity-30"
            >
              <MoreVertical size={16} />
            </button>
            {kebabMenuOpen && (
              <div className="absolute right-0 top-full z-[20000] mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b0d12] shadow-2xl" onMouseLeave={() => setKebabMenuOpen(false)}>
                {publishedAt && (
                  <div className="border-b border-white/10 px-3.5 py-2.5 text-[11px] text-white/40">
                    Published {new Date(publishedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true })}
                  </div>
                )}
                {scheduledPublishAt && (
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-blue-500/10 px-3.5 py-2.5 text-[11px] text-blue-200">
                    <span>Scheduled for {new Date(scheduledPublishAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true })}</span>
                    <button onClick={() => void cancelSchedule()} disabled={savingSchedule} className="shrink-0 font-semibold text-blue-300 hover:text-blue-100 disabled:opacity-40">Cancel</button>
                  </div>
                )}
                <button
                  onClick={() => void unpublishNow()}
                  disabled={pageStatus !== "PUBLISHED" || unpublishing}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <EyeOff size={15} /> {unpublishing ? "Unpublishing…" : "Unpublish"}
                </button>
                <button
                  onClick={() => { setKebabMenuOpen(false); setShowScheduleModal(true); }}
                  disabled={!page?.id}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <CalendarClock size={15} /> Schedule publish
                </button>
                <button
                  onClick={() => { setKebabMenuOpen(false); setShowCustomCodeModal(true); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <Code2 size={15} /> Custom CSS/JS
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden">
        <nav className="absolute inset-y-0 left-0 z-[120] flex w-[60px] flex-col items-center gap-2 border-r border-white/10 bg-[#0d1018]/95 py-5 shadow-xl backdrop-blur-xl">
          {([
            ["ai", Wand2, "AI"], ["insights", CircleGauge, "AI Insights"], ["blocks", Blocks, "Blocks"], ["layers", Layers, "Layers"],
            ["media", ImageIcon, "Media"], ["colors", Droplet, "Colors"], ["settings", Settings, "Settings"],
          ] as const).map(([id, Icon, label]) => <button key={id} title={label} onClick={() => setLeftPanel(id)} className={`grid h-11 w-11 place-items-center rounded-xl ${leftPanel === id ? "bg-blue-500/20 text-blue-300" : "text-white/55 hover:bg-white/10"}`}><Icon size={20}/></button>)}
        </nav>
        <div className={`absolute inset-y-0 left-[60px] z-[110] overflow-hidden border-r border-white/10 bg-[#15171c]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl transition-[width] duration-300 ease-out ${leftPanel ? "w-[360px]" : "w-0 border-r-0"}`}>
        {leftPanel === "ai" && <V12AgentPanel
          key={`${selection?.elementId ?? "no-selection"}:${insightContext}:${insightPrompt || initialPrompt || "builder-agent"}`}
          siteId={siteId}
          pageId={page?.id}
          connected={Boolean(workspace) && !workspaceError}
          events={agentEvents}
          running={agentRunning}
          initialPrompt={insightPrompt || initialPrompt}
          initialAttachments={initialAttachments}
          initialContext={
            selection
              ? "Selected element"
              : insightPrompt
                ? insightContext
                : initialContext
          }
          selectedElementLabel={
            selection
              ? describeBuilderSelection(selection).title
              : undefined
          }
          autoFocus={initialPanel === "ai" || Boolean(initialPrompt) || Boolean(insightPrompt) || initialAttachments.length > 0}
          autoSubmit={initialAutoSubmit && !insightPrompt}
          onCancel={() => agentAbortRef.current?.abort()}
          onReset={async () => {
            setAgentEvents([]);
            setInsightPrompt("");
            try {
              const response = await fetch("/api/builder-v3/agent/reset", {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ siteId }),
              });
              const payload = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(apiErrorMessage(payload, "The AI chat could not be reset."));
            } catch (reason) {
              setAgentEvents(events => [...events, { id: crypto.randomUUID(), type: "tool.failed", title: "Chat reset failed", detail: reason instanceof Error ? reason.message : "Unknown error", timestamp: new Date().toISOString() }]);
            }
          }}
          onClose={() => setLeftPanel(null)}
          onSubmit={async (prompt, agentMode, attachments, creativeDirection, agentContext) => {
            if (prompt.startsWith(RESUME_JOB_PREFIX)) {
              await resumeStuckJob(prompt.slice(RESUME_JOB_PREFIX.length));
              return;
            }
            if (prompt.startsWith(CANCEL_JOB_PREFIX)) {
              await cancelStuckJob(prompt.slice(CANCEL_JOB_PREFIX.length));
              return;
            }
            const attachmentNames = attachments.map(file => file.name);

            /*
             * Canvas selection is authoritative for mutation scope.
             *
             * Never allow an active instrumented selection to fall through
             * to Website/Page generation merely because the AI panel still
             * holds an older context value.
             */
            const effectiveAgentContext: AgentContext =
              selection
                ? "Selected element"
                : agentContext;

            const isFullPageGeneration =
              effectiveAgentContext === "Website" ||
              (
                effectiveAgentContext === "Page" &&
                showBlankPageState
              );

            const directionSummary = isFullPageGeneration
              ? `${creativeDirection.designStyle} · ${creativeDirection.imageStyle}`
              : "";

            const messageDetail = [
              directionSummary,
              attachmentNames.length ? attachmentNames.join(", ") : "",
            ]
              .filter(Boolean)
              .join(" · ");

            setAgentEvents((events) => [
              ...events,
              {
                id: crypto.randomUUID(),
                type: "message",
                role: "user",
                title: prompt || "Replicate the attached design",
                detail: messageDetail || undefined,
                timestamp: new Date().toISOString(),
              },
            ]);
            const controller = new AbortController();
            agentAbortRef.current = controller;
            setAgentRunning(true);
            try {
              if (workspace?.revision) {
                const beforeGeneration = await checkpoint("Before AI generation");
                setUndoStack(items => [...items, beforeGeneration]);
                setRedoStack([]);
              }
              let agentPrompt = prompt;
              let agentAttachments = [...attachments];
              const zipProject = attachments.find(file => file.name.toLowerCase().endsWith(".zip"));
              if (zipProject) {
                setAgentEvents(events => [...events, {
                  id: crypto.randomUUID(),
                  type: "tool.started",
                  title: "Importing code project",
                  detail: "Safely extracting source, moving media to the site library, and recognizing pages and feeds",
                  timestamp: new Date().toISOString(),
                }]);
                const importResponse = await fetch(`/api/builder-v3/projects/${siteId}/import-zip`, {
                  method: "POST",
                  headers: {
                    "content-type": zipProject.type || "application/zip",
                    "x-buildez-revision": String(workspace?.revision ?? 0),
                  },
                  body: zipProject,
                  signal: controller.signal,
                });
                const importPayload = await importResponse.json().catch(() => ({}));
                if (!importResponse.ok) {
                  throw new Error(apiErrorMessage(importPayload, "The ZIP project could not be imported."));
                }
                const imported = importPayload?.data && typeof importPayload.data === "object"
                  ? importPayload.data
                  : importPayload;
                const analysis = imported?.analysis && typeof imported.analysis === "object"
                  ? imported.analysis
                  : {};
                const importedPages = Array.isArray(analysis?.pages) ? analysis.pages.length : 0;
                const commerceDetected = Boolean(analysis?.commerce?.detected);
                setWorkspace(current => ({
                  ...current,
                  revision: typeof imported?.revision === "number" ? imported.revision : current?.revision,
                }));
                setAgentEvents(events => [...events, {
                  id: crypto.randomUUID(),
                  type: "tool.completed",
                  title: "Code project imported",
                  detail: `${importedPages} page${importedPages === 1 ? "" : "s"} recognized · ${imported?.uploadedAssetCount || 0} media asset${imported?.uploadedAssetCount === 1 ? "" : "s"} moved to the site library${commerceDetected ? " · commerce structure detected" : ""}`,
                  timestamp: new Date().toISOString(),
                }]);
                agentAttachments = [];
                agentPrompt = `${prompt || "Load and complete this imported website."}

An uploaded codebase has already been imported into the current project. Read src/buildez.import-analysis.json and src/buildez.theme.json. Preserve its visual design while converting it into the canonical runnable Vite React TypeScript project. Create every recognized page and route, consolidate the shared header and footer, and connect recognized product, blog, and Instagram sections to their correct live feeds. ${commerceDetected ? "This import is an ecommerce storefront: complete its ShopEZ product feed, dynamic product pages, functional cart, checkout, and account experience." : ""}`.trim();
              }
              const form = new FormData();
              form.set("siteId", siteId);
              if (page?.id) form.set("pageId", page.id);
              form.set("prompt", agentPrompt);
              form.set("mode", agentMode);
              if (isFullPageGeneration) {
                form.set(
                  "creativeDirection",
                  JSON.stringify(creativeDirection)
                );
              }

              form.set("context", effectiveAgentContext);

              /*
               * Selected-element AI must carry an authoritative source target.
               *
               * `context = "Selected element"` alone is NOT a mutation boundary.
               * The server must receive the exact instrumented source location
               * so it can enforce element-level writes.
               */
              if (effectiveAgentContext === "Selected element") {
                if (!selection) {
                  throw new Error(
                    "Select an element on the canvas before using Selected element AI."
                  );
                }

                form.set("selectedElement", JSON.stringify({
                  elementId: selection.elementId,
                  kind: selection.kind,
                  tagName: selection.tagName,
                  sourceFile: selection.sourceFile,
                  sourceAnchor: selection.sourceAnchor,
                  parentElementId: selection.parentElementId ?? null,
                  textContent: selection.textContent ?? "",
                  innerHTML: selection.innerHTML ?? "",
                  className: selection.className ?? "",
                  attributes: selection.attributes ?? {},
                  computedStyleSummary: selection.computedStyleSummary ?? {},
                  editableCapabilities: selection.editableCapabilities ?? [],
                  projectRevision: selection.projectRevision,
                }));
              }

              agentAttachments.forEach(file => form.append("attachments", file));

              console.log(
                "[BUILDEZ AGENT CLIENT]",
                {
                  context: effectiveAgentContext,
                  prompt,
                  hasSelection: Boolean(selection),
                  selectedElement:
                    effectiveAgentContext === "Selected element" && selection
                      ? {
                          elementId: selection.elementId,
                          tagName: selection.tagName,
                          sourceFile: selection.sourceFile,
                          sourceAnchor: selection.sourceAnchor,
                          projectRevision: selection.projectRevision,
                          editableCapabilities:
                            selection.editableCapabilities,
                        }
                      : null,
                }
              );

              /*
               * A generation is a resumable job that may span multiple
               * HTTP requests (plan stage, then generate stage) so that
               * no single request has to run the whole pipeline within
               * one timeout window. A `stage.complete` event carries the
               * jobId forward; this loop keeps re-POSTing until the
               * agent sends a terminal `done` event.
               */
              let completed = false;
              let previewUpdated = false;
              let nextForm: FormData | null = form;

              while (nextForm) {
                const requestForm = nextForm;
                nextForm = null;

                const response = await fetch(
                  "/api/builder-v3/agent/run",
                  {
                    method: "POST",
                    body: requestForm,
                    signal: controller.signal,
                  }
                );

                console.log(
                  "[BUILDEZ AGENT RESPONSE]",
                  {
                    status: response.status,
                    ok: response.ok,
                    contentType:
                      response.headers.get("content-type"),
                  }
                );
                if (!response.ok || !response.body) {
                  const payload = await response.json().catch(() => ({}));

                  if (
                    response.status === 429 &&
                    (
                      payload?.code === "AI_CREDITS_EXCEEDED" ||
                      payload?.error?.code === "AI_CREDITS_EXCEEDED"
                    )
                  ) {
                    const creditError = new Error(
                      apiErrorMessage(
                        payload,
                        "You do not have enough AI credits for this generation."
                      )
                    );
                    creditError.name = "AI_CREDITS_EXCEEDED";
                    throw creditError;
                  }

                  if (
                    response.status === 409 &&
                    (
                      payload?.code === "AI_GENERATION_ALREADY_RUNNING" ||
                      payload?.error?.code === "AI_GENERATION_ALREADY_RUNNING"
                    )
                  ) {
                    const alreadyRunningError = new Error(
                      apiErrorMessage(
                        payload,
                        "A previous generation for this website hasn't cleared yet."
                      )
                    );
                    alreadyRunningError.name = "AI_GENERATION_ALREADY_RUNNING";
                    throw alreadyRunningError;
                  }

                  throw new Error(apiErrorMessage(payload, "The agent could not start."));
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffered = "";
                while (true) {
                  const chunk = await reader.read();
                  if (chunk.done) break;
                  buffered += decoder.decode(chunk.value, { stream: true });
                  const lines = buffered.split("\n");
                  buffered = lines.pop() ?? "";
                  for (const line of lines) {
                    if (!line.trim()) continue;
                    const event = JSON.parse(line) as {
                      type: string;
                      title?: string;
                      detail?: string;
                      role?: "assistant";
                      revision?: number;
                      status?: "needs_input" | "completed" | "failed";
                      actions?: Array<{
                        id: string;
                        label: string;
                        value: string;
                      }>;
                      jobId?: string;
                      nextStage?: string;
                    };
                    if (event.type === "stage.complete" && event.jobId) {
                      const resumeForm = new FormData();
                      resumeForm.set("siteId", siteId);
                      resumeForm.set("jobId", event.jobId);
                      nextForm = resumeForm;
                      continue;
                    }
                    if (event.type === "done") {
                      completed = event.status === "completed";

                      setAgentEvents(events => [
                        ...events,
                        {
                          id: crypto.randomUUID(),
                          type:
                            event.status === "failed"
                              ? "tool.failed"
                              : "tool.completed",
                          title:
                            event.status === "needs_input"
                              ? "Waiting for your response"
                              : event.status === "failed"
                                ? "Generation failed"
                                : "Generation complete",
                          detail:
                            event.status === "needs_input"
                              ? "Generation will continue after your response."
                              : undefined,
                          status: event.status,
                          timestamp: new Date().toISOString(),
                        },
                      ]);

                      continue;
                    }
                    if (event.type === "preview.updated") {
                    previewUpdated = true;

                    setWorkspace(current => ({
                      ...current,
                      revision:
                        event.revision ??
                        current?.revision,
                    }));

                    /*
                     * Selected-element writes modify one source file.
                     *
                     * The running Vite preview can consume that change
                     * through HMR. Do NOT restart/remount the preview,
                     * because doing so destroys the visitor's scroll
                     * position and makes a tiny element edit feel like
                     * a full page regeneration.
                     *
                     * Website/Page generation keeps the existing hard
                     * refresh behavior below.
                     */
                    if (
                      effectiveAgentContext !==
                      "Selected element"
                    ) {
                      setPreviewGeneration(
                        value => value + 1
                      );
                    }

                    setAgentEvents(events => [
                      ...events,
                      {
                        id: crypto.randomUUID(),
                        type: "tool.completed",
                        title:
                          event.title ||
                          "Canvas updated",
                        detail: event.detail,
                        timestamp:
                          new Date().toISOString(),
                      },
                    ]);

                    continue;
                  }
                  if (["message", "tool.started", "tool.completed", "tool.failed"].includes(event.type)) {
                      setAgentEvents(events => [
                        ...events,
                        {
                          id: crypto.randomUUID(),
                          type: event.type as V12AgentEvent["type"],
                          role: event.role,
                          title: event.title || "Agent update",
                          detail: event.detail,
                          status: event.status,
                          actions: event.actions,
                          timestamp: new Date().toISOString(),
                        },
                      ]);
                    }
                  }
                }
              }
              if (completed) {
                const treeResponse = await fetch(
                  `/api/builder-v3/projects/${siteId}/tree?refresh=${Date.now()}`,
                  { cache: "no-store" }
                );

                if (treeResponse.ok) {
                  const treePayload = await treeResponse.json();

                  const normalized =
                    treePayload?.data &&
                    typeof treePayload.data === "object"
                      ? treePayload.data
                      : treePayload;

                  setWorkspace({
                    revision: normalized?.revision,
                    files: Array.isArray(normalized?.files)
                      ? normalized.files
                      : [],
                    pageManifest: normalized?.pageManifest ?? null,
                  });
                }

                /*
                 * Full Website/Page generations can touch many files and
                 * still require a deterministic preview remount.
                 *
                 * Selected-element edits are intentionally one-file AST
                 * mutations and should remain in-place. Vite HMR updates
                 * the running preview without losing scroll position.
                 */
                if (
                  effectiveAgentContext !==
                    "Selected element" &&
                  !previewUpdated
                ) {
                  setPreviewGeneration(
                    value => value + 1
                  );
                }
              }
            } catch (reason) {
              const creditExceeded =
                reason instanceof Error &&
                reason.name === "AI_CREDITS_EXCEEDED";
              const alreadyRunning =
                reason instanceof Error &&
                reason.name === "AI_GENERATION_ALREADY_RUNNING";

              setAgentEvents(events => [
                ...events,
                creditExceeded
                  ? {
                      id: crypto.randomUUID(),
                      type: "message" as const,
                      role: "assistant" as const,
                      title: "You're out of AI credits for this billing cycle.",
                      detail: reason instanceof Error ? reason.message : undefined,
                      showUpgrade: true,
                      timestamp: new Date().toISOString(),
                    }
                  : alreadyRunning
                  ? {
                      id: crypto.randomUUID(),
                      type: "message" as const,
                      role: "assistant" as const,
                      title: "A previous generation for this website hasn't cleared yet.",
                      detail: "This usually resolves itself within a few minutes. Reload the page to check its status, or try again shortly.",
                      timestamp: new Date().toISOString(),
                    }
                  : {
                      id: crypto.randomUUID(),
                      type: "tool.failed" as const,
                      title: controller.signal.aborted
                        ? "Stopped by you"
                        : "Agent request failed",
                      detail: reason instanceof Error
                        ? reason.message
                        : "Unknown error",
                      timestamp: new Date().toISOString(),
                    },
              ]);
            } finally {
              if (agentAbortRef.current === controller) agentAbortRef.current = null;
              setAgentRunning(false);
            }
          }}
        />}
        {leftPanel === "insights" && <AIInsightsPanel
          siteId={siteId}
          pageId={page?.id}
          pageTitle={page?.title}
          refreshKey={workspace?.revision}
          onClose={() => setLeftPanel(null)}
          onFix={(prompt) => {
            setInsightPrompt(prompt);
            setInsightContext("Page");
            setLeftPanel("ai");
          }}
        />}
        {leftPanel === "blocks" && <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-r border-[#292c33] bg-[#0e1117]">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#292c33] px-5"><strong className="text-xl font-semibold tracking-tight">Blocks</strong><button onClick={() => setLeftPanel(null)} aria-label="Close blocks" className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"><X size={23}/></button></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5 [scrollbar-color:#353941_transparent]">
            {widgetGroups.map((group) => <section key={group.name} className="mb-9 last:mb-0">
              <div className="mb-4 px-1"><h3 className="text-base font-semibold text-white">{group.name}</h3><p className="mt-1 text-sm text-white/55">{group.description}</p></div>
              <div className="space-y-3">{group.items.map(({ name, description, icon: Icon }) => <div key={name} className="group flex min-h-[88px] items-center gap-3 rounded-[22px] border border-[#30343b] bg-[#14161a] px-4 py-3 transition duration-200 hover:border-[#444a54] hover:bg-[#181b20]">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[17px] border border-[#3b3f47] bg-[#1d2025] text-white/85"><Icon size={25} strokeWidth={1.8}/></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-base font-semibold text-white">{name}</span><span className="mt-1 block truncate text-sm text-white/55">{description}</span></span>
                <button type="button" onClick={() => { setInsightPrompt(`Add a polished ${name} widget to the current page. Match the existing visual system, content hierarchy, and responsive behavior.`); setLeftPanel("ai"); }} aria-label={`Add ${name}`} title={`Add ${name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-[#3b3f47] bg-[#1d2025] text-white/75 transition hover:border-white/30 hover:bg-[#252930] hover:text-white active:scale-95"><Plus size={22} strokeWidth={1.8}/></button>
              </div>)}</div>
            </section>)}
          </div>
        </aside>}
        {leftPanel === "media" && (
          <aside className="dark flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-r border-[#292c33] bg-[#0e1117]">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#292c33] px-5">
              <strong className="text-xl font-semibold tracking-tight text-white">Media</strong>
              <button onClick={() => setLeftPanel(null)} aria-label="Close media" className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"><X size={23}/></button>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <MediaLibrary siteId={siteId} compact hideHero />
            </div>
          </aside>
        )}
        {leftPanel === "colors" && <ColorsPanel siteId={siteId} onClose={() => setLeftPanel(null)} />}
        {leftPanel === "settings" && <SettingsPanel siteSlug={siteSlug} siteName={siteName} pageStatus={pageStatus} onClose={() => setLeftPanel(null)} />}
        {leftPanel === "layers" && (
          <LayersPanel
            tree={elementTree}
            selectedElementId={selection?.elementId}
            onSelect={id => sendCanvas("BUILDEZ_SELECT_ELEMENT", { elementId: id })}
            onRefresh={() => sendCanvas("BUILDEZ_REQUEST_TREE")}
            onClose={() => setLeftPanel(null)}
          />
        )}
        </div>
        <main
          className={`absolute inset-y-0 overflow-auto overscroll-contain transition-[left,right] duration-300 ease-out ${darkCanvas ? "bg-[#20232a]" : "bg-[#e8ecf2]"}`}
          style={{
            left: `${canvasViewportLeft}px`,
            right: `${canvasViewportRight}px`,
            scrollbarGutter: "stable",
          }}
        >
          {showCanvasGeneration && <GenerationArtwork />}
          {showCanvasGreeting && <BlankCanvasGreeting onAI={() => setLeftPanel("ai")} onBlocks={() => setLeftPanel("blocks")} />}
          <div
            className="relative min-h-full"
            style={{
              minWidth: device === "desktop" ? "100%" : `max(100%, ${widths[device]})`,
              height: "100%",
            }}
          >
          <div
            style={{
              /*
               * Desktop represents the real responsive browser viewport.
               * Fill every pixel available between the builder panels.
               *
               * Tablet/mobile remain explicit device-width previews.
               */
              width: device === "desktop" ? "100%" : widths[device],
              minWidth: device === "desktop" ? "100%" : widths[device],
              height: "max(100%, 700px)",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              marginInline: device === "desktop" ? "0" : "auto",
            }}
            className="relative overflow-hidden rounded-sm bg-white shadow-[0_24px_70px_rgb(0_0_0/38%),0_0_0_1px_rgb(255_255_255/7%)] transition-[width]"
          >
          {!previewUrl && !error && !workspaceLoaded && <div className="min-h-[700px] bg-white"/>}
          {!previewUrl && !error && workspaceLoaded && (workspace?.files?.length ?? 0) > 0 && <div className="grid min-h-[700px] place-items-center bg-white text-sm text-slate-400"><div className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"/>Preparing preview</div></div>}
          {error && <div className="absolute inset-0 z-30 grid min-h-[700px] place-items-center bg-white p-8 text-center text-red-700"><div><strong>Preview unavailable</strong><p className="mt-2 max-w-xl text-sm">{error}</p><button type="button" onClick={() => setPreviewGeneration(value => value + 1)} className="mt-5 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Retry preview</button></div></div>}
          {iframeUrl && !showBlankPageState && <iframe ref={iframeRef} key={`${previewUrl}-${previewGeneration}`} title={`${siteName} ${mode}`} src={iframeUrl} onLoad={() => {
            // A recovered Vite/React preview can load successfully after a
            // previous render exception. Clear that stale blocking overlay;
            // a genuine new runtime failure will immediately report itself
            // through BUILDEZ_RUNTIME_ERROR and restore the error state.
            setError(undefined);
            sendCanvas("BUILDEZ_EDIT_MODE_CHANGED", { mode });
          }} className="h-full min-h-[700px] w-full border-0" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" />}
          {mode === "edit" && previewUrl && <div className="pointer-events-none absolute right-3 top-3 z-[150] rounded-md border border-blue-300/30 bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">Edit mode · select an element</div>}
          {mode === "edit" && previewUrl && selection && <NodeToolbar selection={selection} onAction={handleNodeAction}/>}
          </div>
          </div>
        </main>
        <div className={`absolute inset-y-0 right-0 z-[115] overflow-hidden transition-[width,transform,opacity] duration-300 ease-out ${inspectorCollapsed ? "pointer-events-none w-0 translate-x-8 opacity-0" : "w-[360px] translate-x-0 opacity-100"}`}><SourceInspector siteId={siteId} selection={mode === "edit" ? selection : undefined} disabled={saving} onPatch={patch => selection ? applyElementPatch(selection, patch) : Promise.resolve()} onOpenSource={() => selection && handleNodeAction("source")} onCollapse={() => setInspectorCollapsed(true)} onAIRequest={prompt=>{setInsightContext("Selected element");setInsightPrompt(prompt);setLeftPanel("ai")}}/></div>
        <button type="button" onClick={() => setInspectorCollapsed(false)} aria-label="Show inspector" title="Show inspector" className={`absolute right-3 top-3 z-[116] grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#15171c]/95 text-white/70 shadow-xl backdrop-blur-xl transition-[opacity,transform] duration-200 hover:text-white ${inspectorCollapsed ? "translate-x-0 opacity-100 delay-150" : "pointer-events-none translate-x-3 opacity-0"}`}><PanelRightOpen size={18}/></button>
      </section>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-[30000] transition-all duration-300 ${toastVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
        >
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#171b22] px-4 py-3 text-sm text-white shadow-2xl shadow-black/50">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300"><Check size={15}/></span>
            <span className="whitespace-nowrap">{toast.message}</span>
            {toast.href && <a href={toast.href} target="_blank" rel="noreferrer" className="whitespace-nowrap text-xs font-semibold text-blue-300 hover:text-blue-200">View</a>}
            <button onClick={() => setToastVisible(false)} aria-label="Dismiss notification" className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"><X size={14}/></button>
          </div>
        </div>
      )}
      {publishResult && <div role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title" className="fixed inset-0 z-[30000] grid place-items-center bg-black/65 p-5 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPublishResult(null); }}>
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#11141c] text-white shadow-2xl shadow-black/60">
          <div className="flex items-start justify-between border-b border-white/10 p-5"><div className="flex gap-3"><span className={`grid h-10 w-10 place-items-center rounded-full ${publishResult.status === "success" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{publishResult.status === "success" ? <Check size={20}/> : <X size={20}/>}</span><div><h2 id="publish-dialog-title" className="font-semibold">{publishResult.status === "success" ? "Website published" : "Publishing failed"}</h2><p className="mt-1 text-sm text-white/50">{publishResult.message}</p></div></div><button onClick={() => setPublishResult(null)} aria-label="Close publish result" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><X size={18}/></button></div>
          {publishResult.status === "success" && publishResult.url && <div className="px-5 pt-5"><div className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Published URL</div><a href={publishResult.url} target="_blank" rel="noreferrer" className="mt-1 block truncate rounded-lg bg-black/20 px-3 py-2 font-mono text-xs text-emerald-300 hover:text-emerald-200">{publishResult.url}</a></div>}
          <div className="flex justify-end gap-2 p-5"><button onClick={() => setPublishResult(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Close</button>{publishResult.status === "success" && publishResult.url ? <a href={publishResult.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"><ExternalLink size={15}/>View page</a> : <button onClick={() => { setPublishResult(null); void publishNow(); }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">Try again</button>}</div>
        </div>
      </div>}

      {showCustomCodeModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="custom-code-dialog-title" className="fixed inset-0 z-[40000] grid place-items-center bg-black/70 p-5 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCustomCodeModal(false); }}>
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11141c]/90 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl">
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-blue-300"><Code2 size={18} /></span>
                <div>
                  <h2 id="custom-code-dialog-title" className="font-semibold">Custom CSS / JS</h2>
                  <p className="mt-1 text-sm text-white/50">Injected on this page only, once published.</p>
                </div>
              </div>
              <button onClick={() => setShowCustomCodeModal(false)} aria-label="Close" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <label htmlFor="custom-css-input" className="text-xs font-semibold text-white/70">Custom CSS</label>
                <textarea id="custom-css-input" value={customCss} onChange={(event) => setCustomCss(event.target.value)} spellCheck={false} placeholder={".hero { padding-top: 4rem; }"} className="mt-2 h-32 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-white/85 outline-none focus:border-blue-400" />
              </div>
              <div>
                <label htmlFor="custom-js-input" className="text-xs font-semibold text-white/70">Custom JS</label>
                <textarea id="custom-js-input" value={customJs} onChange={(event) => setCustomJs(event.target.value)} spellCheck={false} placeholder={"console.log('Loaded');"} className="mt-2 h-32 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-white/85 outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 p-5">
              <button onClick={() => setShowCustomCodeModal(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
              <button onClick={() => void saveCustomCode()} disabled={savingCustomCode} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40">{savingCustomCode ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal
          initialValue={scheduledPublishAt}
          saving={savingSchedule}
          onCancel={() => setShowScheduleModal(false)}
          onSave={(value) => void saveSchedule(value)}
        />
      )}
    </main>
  );
}

function ScheduleModal({
  initialValue,
  saving,
  onCancel,
  onSave,
}: {
  initialValue: string | null;
  saving: boolean;
  onCancel(): void;
  onSave(dateTimeLocal: string): void;
}) {
  const toLocalInputValue = (iso: string | null) => {
    const date = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };
  const [value, setValue] = useState(toLocalInputValue(initialValue));
  const minValue = toLocalInputValue(null).slice(0, 10) + "T00:00";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="schedule-dialog-title" className="fixed inset-0 z-[40000] grid place-items-center bg-black/70 p-5 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#11141c]/90 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-blue-300"><CalendarClock size={18} /></span>
            <div>
              <h2 id="schedule-dialog-title" className="font-semibold">Schedule publish</h2>
              <p className="mt-1 text-sm text-white/50">Publishes automatically at the chosen time.</p>
            </div>
          </div>
          <button onClick={onCancel} aria-label="Close" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5">
          <label htmlFor="schedule-datetime-input" className="text-xs font-semibold text-white/70">Date &amp; time</label>
          <input
            id="schedule-datetime-input"
            type="datetime-local"
            value={value}
            min={minValue}
            onChange={(event) => setValue(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-blue-400 [color-scheme:dark]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 p-5">
          <button onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
          <button onClick={() => onSave(value)} disabled={saving || !value} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40">{saving ? "Scheduling…" : "Schedule"}</button>
        </div>
      </div>
    </div>
  );
}

const COLOR_FIELDS: Array<{ key: string; label: string }> = [
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "textPrimary", label: "Text (primary)" },
  { key: "textSecondary", label: "Text (secondary)" },
  { key: "border", label: "Border" },
];

function ColorsPanel({ siteId, onClose }: { siteId: string; onClose(): void }) {
  const [tokens, setTokens] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sites/${siteId}/design-tokens`, { cache: "no-store" })
      .then(response => response.json())
      .then(payload => { if (!cancelled) setTokens((payload?.designTokens && typeof payload.designTokens === "object" ? payload.designTokens : {}) as Record<string, unknown>); })
      .catch(() => { if (!cancelled) setError("Could not load colors."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [siteId]);

  const colors = (tokens?.colors && typeof tokens.colors === "object" ? tokens.colors : {}) as Record<string, string>;

  function setColor(key: string, value: string) {
    setTokens(current => ({ ...(current || {}), colors: { ...colors, [key]: value } }));
  }

  async function save() {
    if (!tokens || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/sites/${siteId}/design-tokens`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ designTokens: tokens }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not save colors.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save colors.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#11141c]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <strong className="text-xl font-semibold tracking-tight text-white">Colors</strong>
        <button onClick={onClose} aria-label="Close colors" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-white/45">Loading…</p>
        ) : (
          <>
            <p className="mb-4 text-xs leading-5 text-white/40">
              These brand colors guide future AI generations for this site. They don&apos;t retroactively re-theme pages already built — ask the AI to apply a new palette to update the live design.
            </p>
            <div className="space-y-3">
              {COLOR_FIELDS.map(field => {
                const value = typeof colors[field.key] === "string" ? colors[field.key] : "#000000";
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
                      onChange={event => setColor(field.key, event.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0"
                    />
                    <div className="min-w-0 flex-1">
                      <label className="block text-[11px] text-white/50">{field.label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={event => setColor(field.key, event.target.value)}
                        spellCheck={false}
                        className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1 font-mono text-xs text-white/85 outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
          </>
        )}
      </div>
      <div className="border-t border-white/10 p-4">
        <button onClick={() => void save()} disabled={loading || saving} className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving…" : "Save colors"}</button>
      </div>
    </aside>
  );
}

function SettingsPanel({
  siteSlug,
  siteName,
  pageStatus,
  onClose,
}: {
  siteSlug: string;
  siteName: string;
  pageStatus: "DRAFT" | "PUBLISHED";
  onClose(): void;
}) {
  return (
    <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#11141c]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <strong className="text-xl font-semibold tracking-tight text-white">Settings</strong>
        <button onClick={onClose} aria-label="Close settings" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Website</div>
          <div className="mt-1 text-sm font-medium text-white">{siteName}</div>
          <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${pageStatus === "PUBLISHED" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-blue-500/20 bg-blue-500/10 text-blue-400"}`}>{pageStatus === "PUBLISHED" ? "Published" : "Draft"}</span>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/45">
          For domains, SEO, analytics, privacy and publishing controls, open the full site settings.
        </p>
        <a
          href={`/app/${siteSlug}/settings`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          <ExternalLink size={14} /> Open site settings
        </a>
      </div>
    </aside>
  );
}

function LayersPanel({
  tree,
  selectedElementId,
  onSelect,
  onRefresh,
  onClose,
}: {
  tree: BuilderTreeNode[] | null;
  selectedElementId?: string;
  onSelect(elementId: string): void;
  onRefresh(): void;
  onClose(): void;
}) {
  /*
   * The generated site can render the same source component more than once
   * (e.g. a card in a .map() list), and the instrumentation stamps
   * data-buildez-id per JSX source location — so the same elementId can
   * appear on multiple live DOM nodes. Deduplicate into a proper id-keyed
   * tree (first occurrence wins) instead of repeatedly filtering the flat
   * array, both for correctness and to guarantee unique React keys.
   */
  const byId = new Map<string, BuilderTreeNode>();
  for (const node of tree || []) {
    if (!byId.has(node.elementId)) byId.set(node.elementId, node);
  }
  const childIds = new Map<string, string[]>();
  for (const node of byId.values()) {
    if (!node.parentElementId || !byId.has(node.parentElementId)) continue;
    const siblings = childIds.get(node.parentElementId) ?? [];
    if (!siblings.includes(node.elementId)) siblings.push(node.elementId);
    childIds.set(node.parentElementId, siblings);
  }
  const rootIds = [...byId.values()]
    .filter(node => !node.parentElementId || !byId.has(node.parentElementId))
    .map(node => node.elementId);

  function renderNode(id: string, depth: number, visited: ReadonlySet<string>) {
    const node = byId.get(id);
    if (!node || visited.has(id)) return null;
    const nextVisited = new Set(visited).add(id);
    const children = childIds.get(id) ?? [];
    return (
      <div key={id}>
        <button
          onClick={() => onSelect(id)}
          style={{ paddingLeft: `${12 + depth * 14}px` }}
          className={`flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-xs transition ${selectedElementId === id ? "bg-blue-500/20 text-blue-200" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
        >
          <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[9px] uppercase text-white/40">{node.tagName}</span>
          <span className="truncate">{node.label || node.kind}</span>
        </button>
        {children.map(childId => renderNode(childId, depth + 1, nextVisited))}
      </div>
    );
  }

  return (
    <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#11141c]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <strong className="text-xl font-semibold tracking-tight text-white">Layers</strong>
        <div className="flex items-center gap-1">
          <button onClick={onRefresh} aria-label="Refresh layers" title="Refresh" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><RefreshCw size={16}/></button>
          <button onClick={onClose} aria-label="Close layers" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"><X size={18}/></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tree === null ? (
          <p className="p-3 text-sm text-white/45">Loading layers…</p>
        ) : !rootIds.length ? (
          <p className="p-3 text-sm text-white/45">No elements found on this page yet.</p>
        ) : (
          rootIds.map(id => renderNode(id, 0, new Set()))
        )}
      </div>
    </aside>
  );
}
