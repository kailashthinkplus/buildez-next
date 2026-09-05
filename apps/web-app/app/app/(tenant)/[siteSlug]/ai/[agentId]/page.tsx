"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  History,
  Loader2,
  MoreVertical,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import type { InsightAgent, InsightAgentId, InsightReport } from "@/modules/insights/types";
import { agentHasOwnFindings, getAgentFindings, groupFindings } from "@/modules/insights/insightEngine";
import { useWorkspace } from "../../../components/WorkspaceContext";
import {
  fixHref,
  Priority,
  Score,
  Status,
  type AgentRun,
  type ChatMessage,
  type RunHistoryEntry,
} from "../shared";
import { AgentFunctionality } from "./functionality";
import { AGENT_CAPABILITIES } from "./capabilities";
import { AgentIcon, agentGradientCss } from "./thumbnail";

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

function isCreditsExceeded(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as { code?: unknown; error?: unknown };
  if (record.code === "AI_CREDITS_EXCEEDED") return true;
  const error = record.error;
  if (error && typeof error === "object" && (error as { code?: unknown }).code === "AI_CREDITS_EXCEEDED") return true;
  return false;
}

type FixRunState = {
  status: "applying" | "done" | "needs-input" | "error";
  message?: string;
};

const VALID_AGENT_IDS = [
  "seo-agent",
  "geo-agent",
  "speed-agent",
  "accessibility-agent",
  "conversion-agent",
  "quality-agent",
  "business-agent",
  "marketing-agent",
  "whatsapp-agent",
  "chatbot-agent",
];


type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  generatedBy?: string;
  actions?: AgentRun["actions"];
};

export default function AgentDetailPage() {
  const { siteSlug, agentId } = useParams<{ siteSlug: string; agentId: string }>();
  const searchParams = useSearchParams();
  const { websites, loading: workspaceLoading } = useWorkspace();
  const website = websites.find((item) => item.slug === siteSlug);

  const [agent, setAgent] = useState<InsightAgent>();
  const [report, setReport] = useState<InsightReport>();
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creditsExceeded, setCreditsExceeded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [running, setRunning] = useState(false);
  const [composerText, setComposerText] = useState(searchParams.get("prompt") || "");
  const [activeRun, setActiveRun] = useState<AgentRun>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [fixRuns, setFixRuns] = useState<Record<string, FixRunState>>({});
  const autoOpened = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isValidAgent = VALID_AGENT_IDS.includes(agentId);

  const load = useCallback(async () => {
    if (!website?.id) {
      setLoading(workspaceLoading);
      setError(workspaceLoading ? "" : "This website does not belong to the current workspace.");
      return;
    }
    setLoading(true);
    setError("");
    setCreditsExceeded(false);
    try {
      const response = await fetch(
        `/api/sites/${encodeURIComponent(website.id)}/ai-agents`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Your AI team could not be loaded");
      const found = (payload.agents || []).find((item: InsightAgent) => item.id === agentId);
      if (!found) throw new Error("This specialist agent could not be found.");
      setAgent(found);
      setReport(payload.report);
      setHistory((payload.recentRuns || []).filter((entry: RunHistoryEntry) => entry.agentId === agentId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your AI team could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [website?.id, workspaceLoading, agentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAgent = useCallback(
    async (request: string) => {
      if (!website?.id || running) return;
      setRunning(true);
      setError("");
      setCreditsExceeded(false);
      try {
        const response = await fetch(
          `/api/sites/${encodeURIComponent(website.id)}/ai-agents`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ agentId, prompt: request }),
          },
        );
        const payload = await response.json();
        if (!response.ok) {
          if (isCreditsExceeded(payload)) setCreditsExceeded(true);
          throw new Error(payload?.error || "The agent could not finish");
        }
        setActiveRun({ ...payload.run, prompt: request || undefined });
        setChatMessages([]);
        setHistory((current) => [
          {
            id: payload.run.id,
            agentId: agentId as InsightAgentId,
            prompt: request || null,
            summary: payload.run.summary,
            generatedBy: payload.run.generatedBy || "analytics",
            createdAt: payload.run.completedAt,
          },
          ...current,
        ]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "The agent could not finish");
      } finally {
        setRunning(false);
      }
    },
    [website?.id, running, agentId],
  );

  const reopenRun = useCallback(
    async (entry: RunHistoryEntry) => {
      if (!agent || !website?.id) return;
      setHistoryOpen(false);
      setActiveRun({
        id: entry.id,
        agent,
        completedAt: entry.createdAt,
        summary: entry.summary,
        generatedBy: entry.generatedBy as "ai" | "analytics",
        actions: [],
        prompt: entry.prompt || undefined,
      });
      setChatMessages([]);
      try {
        const response = await fetch(
          `/api/sites/${encodeURIComponent(website.id)}/ai-agents/runs/${encodeURIComponent(entry.id)}/messages`,
          { cache: "no-store" },
        );
        const payload = await response.json();
        if (response.ok) setChatMessages(payload.messages || []);
      } catch {
        // history is best-effort; the run summary above still renders
      }
    },
    [agent, website?.id],
  );

  useEffect(() => {
    if (!agent || autoOpened.current) return;
    const runId = searchParams.get("run");
    autoOpened.current = true;
    if (runId) {
      const entry = history.find((item) => item.id === runId);
      if (entry) void reopenRun(entry);
    } else if (searchParams.get("autoRun") === "1" && composerText.trim()) {
      // Arrived here from a dashboard chatbox that classified the prompt as
      // belonging to this agent — run it immediately instead of leaving the
      // prompt sitting in the composer waiting for a manual click.
      void handleSend(composerText.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, history, searchParams, reopenRun]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeRun, chatMessages.length]);

  async function sendFollowUp(question: string) {
    if (!question || !activeRun || !website?.id || chatLoading) return;
    setChatLoading(true);
    setError("");
    setCreditsExceeded(false);
    setChatMessages((current) => [
      ...current,
      { id: `pending-${Date.now()}`, role: "user", content: question, createdAt: new Date().toISOString() },
    ]);
    try {
      const response = await fetch(
        `/api/sites/${encodeURIComponent(website.id)}/ai-agents/runs/${encodeURIComponent(activeRun.id)}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: question }),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        if (isCreditsExceeded(payload)) setCreditsExceeded(true);
        throw new Error(payload?.error || "The agent could not reply");
      }
      setChatMessages((current) => [
        ...current.filter((message) => !message.id.startsWith("pending-")),
        ...(payload.messages || []),
      ]);
    } catch (reason) {
      setChatMessages((current) => current.filter((message) => !message.id.startsWith("pending-")));
      setError(reason instanceof Error ? reason.message : "The agent could not reply");
    } finally {
      setChatLoading(false);
    }
  }

  const anyFixApplying = Object.values(fixRuns).some((run) => run.status === "applying");

  const applyFinding = useCallback(
    async (page: { id: string; pageId?: string; fixPrompt: string }) => {
      if (!website?.id || anyFixApplying) return;
      setFixRuns((current) => ({ ...current, [page.id]: { status: "applying" } }));

      try {
        let finalMessage = "";
        let finalStatus: "completed" | "needs_input" | "failed" = "completed";
        let nextForm: FormData | null = new FormData();
        nextForm.set("siteId", website.id);
        if (page.pageId) nextForm.set("pageId", page.pageId);
        nextForm.set("prompt", page.fixPrompt);
        nextForm.set("mode", "auto");
        nextForm.set("context", page.pageId ? "Page" : "Website");

        while (nextForm) {
          const requestForm = nextForm;
          nextForm = null;
          const response = await fetch("/api/builder-v3/agent/run", {
            method: "POST",
            body: requestForm,
          });
          if (!response.ok || !response.body) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(apiErrorMessage(payload, "The fix could not be applied."));
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
            for (const rawLine of lines) {
              if (!rawLine.trim()) continue;
              const event = JSON.parse(rawLine) as {
                type: string;
                title?: string;
                status?: "needs_input" | "completed" | "failed";
                jobId?: string;
              };
              if (event.type === "stage.complete" && event.jobId) {
                const resumeForm = new FormData();
                resumeForm.set("siteId", website.id);
                resumeForm.set("jobId", event.jobId);
                nextForm = resumeForm;
                continue;
              }
              if (event.type === "message" && event.title) {
                finalMessage = event.title;
              }
              if (event.type === "done") {
                finalStatus = event.status || "completed";
              }
            }
          }
        }

        setFixRuns((current) => ({
          ...current,
          [page.id]: {
            status:
              finalStatus === "completed"
                ? "done"
                : finalStatus === "needs_input"
                  ? "needs-input"
                  : "error",
            message: finalMessage || undefined,
          },
        }));
        if (finalStatus === "completed") void load();
      } catch (reason) {
        setFixRuns((current) => ({
          ...current,
          [page.id]: {
            status: "error",
            message: reason instanceof Error ? reason.message : "The fix could not be applied.",
          },
        }));
      }
    },
    [website?.id, anyFixApplying, load],
  );

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? composerText).trim();
    if (!text) return;
    setComposerText("");
    if (!activeRun) {
      await runAgent(text);
    } else {
      await sendFollowUp(text);
    }
  }

  const transcript: TranscriptMessage[] = useMemo(() => {
    if (!activeRun) return [];
    const items: TranscriptMessage[] = [
      {
        id: `${activeRun.id}-prompt`,
        role: "user",
        content: activeRun.prompt || `Run ${activeRun.agent.name}`,
      },
      {
        id: `${activeRun.id}-summary`,
        role: "assistant",
        content: activeRun.summary,
        generatedBy: activeRun.generatedBy,
        actions: activeRun.actions,
      },
    ];
    for (const message of chatMessages) {
      items.push({ id: message.id, role: message.role === "user" ? "user" : "assistant", content: message.content });
    }
    return items;
  }, [activeRun, chatMessages]);

  if (!isValidAgent) {
    return (
      <div className="mx-auto max-w-2xl py-14 text-center">
        <p className="text-sm dashboard-muted">Unknown specialist agent.</p>
        <Link href={`/app/${siteSlug}/ai`} className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-300">
          Back to your AI team
        </Link>
      </div>
    );
  }

  if (loading && !agent) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-500" />
          <p className="mt-3 text-sm dashboard-muted">Loading specialist…</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl py-14 text-center">
        <p className="text-sm dashboard-muted">{error || "This specialist agent could not be loaded."}</p>
        <Link href={`/app/${siteSlug}/ai`} className="mt-3 inline-block text-sm font-semibold text-blue-600 dark:text-blue-300">
          Back to your AI team
        </Link>
      </div>
    );
  }

  const hasOwnFindings = agentHasOwnFindings(agent.id);
  const findings = report && hasOwnFindings ? getAgentFindings(report, agent.id) : [];
  const grouped = groupFindings(findings);
  const capabilities = AGENT_CAPABILITIES[agent.id] || [];

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-[1100px] flex-col">
      <div className="shrink-0">
        <Link
          href={`/app/${siteSlug}/ai`}
          className="flex w-fit items-center gap-1.5 text-xs font-semibold dashboard-muted dashboard-hover"
        >
          <ArrowLeft size={14} /> Your AI team
        </Link>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
            <p>{error}</p>
            {creditsExceeded && (
              <Link
                href="/app/workspace/billing#ai-credits"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-700 transition hover:bg-amber-500/20 dark:text-amber-300"
              >
                <Sparkles size={11} /> Upgrade plan
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        {/* The agent hero lives inside the scrollable chat area (as its
            first element) rather than pinned above it, so it scrolls away
            with the rest of the conversation instead of staying sticky. */}
        <header
          className="relative mb-4 overflow-hidden rounded-2xl p-4 text-white sm:p-6"
          style={{ background: agentGradientCss(agent.id) }}
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/4 h-28 w-44 rounded-full bg-black/10 blur-2xl" />
          <AgentIcon
            agentId={agent.id}
            className="pointer-events-none absolute right-4 top-1/2 hidden h-24 w-32 -translate-y-1/2 opacity-90 sm:block md:right-8"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/70">{agent.role}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-[-.03em] sm:text-2xl">{agent.name}</h1>
              <p className="mt-1 max-w-md text-xs leading-5 text-white/80 sm:text-sm">{agent.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Status status={agent.status} />
                <Score score={agent.score} />
              </div>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              aria-label="Run history"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-black/20 text-white hover:bg-black/30"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {transcript.length === 0 ? (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold dashboard-muted">
              <Wand2 size={13} /> Things {agent.name} can do
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => {
                const CapabilityIcon = capability.icon;
                return (
                  <button
                    key={capability.title}
                    onClick={() => void handleSend(capability.prompt)}
                    disabled={running}
                    className="dashboard-card rounded-xl p-4 text-left dashboard-hover disabled:opacity-50"
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-lg ${capability.color}`}>
                      <CapabilityIcon size={17} />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold">{capability.title}</h3>
                    <p className="mt-1 text-xs leading-5 dashboard-muted">{capability.description}</p>
                  </button>
                );
              })}
            </div>
            {running && (
              <div className="mt-4 flex items-center gap-2 text-xs dashboard-muted">
                <Loader2 size={14} className="animate-spin" /> {agent.name} is working…
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transcript.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "self-end bg-blue-600 text-white"
                    : "self-start dashboard-card"
                }`}
              >
                {message.role === "assistant" && message.generatedBy === "ai" && (
                  <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                    <Sparkles size={10} /> AI generated
                  </span>
                )}
                <p>{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {message.actions.map((action) => (
                      <div key={action.id} className="rounded-xl border dashboard-border bg-[var(--dashboard-surface)] p-3">
                        <Priority priority={action.priority} />
                        <p className="mt-2 text-xs font-semibold">{action.title}</p>
                        <Link
                          href={fixHref(website?.id || "", action)}
                          className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-300"
                        >
                          Review in builder <ArrowRight size={11} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(running || chatLoading) && (
              <div className="flex items-center gap-2 self-start rounded-2xl px-4 py-3 text-xs dashboard-muted dashboard-card">
                <Loader2 size={14} className="animate-spin" /> {agent.name} is typing…
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {website?.id && <AgentFunctionality agentId={agent.id} siteId={website.id} report={report} />}

        {hasOwnFindings && (
          <section className="mt-6 pb-4">
            <h2 className="text-lg font-semibold">
              All findings <span className="dashboard-faint">({findings.length})</span>
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {grouped.length === 0 && (
                <p className="dashboard-card rounded-xl p-4 text-sm dashboard-muted">
                  No issues found in this specialist's area right now.
                </p>
              )}
              {grouped.map((group) => (
                <div key={group.key} className="dashboard-card rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Priority priority={group.priority} />
                    {group.pages.length > 1 && (
                      <span className="text-[10px] dashboard-faint">{group.pages.length} pages affected</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{group.title}</h3>
                  <p className="mt-1 text-xs leading-5 dashboard-muted">{group.description}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {group.pages.map((page) => {
                      const fixState = fixRuns[page.id];
                      return (
                        <div
                          key={page.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border dashboard-border px-2.5 py-1.5"
                        >
                          {group.pages.length > 1 && (
                            <span className="text-[10px] font-semibold dashboard-faint">
                              {page.pageTitle || "Page"}
                            </span>
                          )}
                          <button
                            onClick={() => void applyFinding(page)}
                            disabled={fixState?.status === "applying" || fixState?.status === "done" || anyFixApplying}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 disabled:opacity-50 dark:text-blue-300"
                          >
                            {fixState?.status === "applying" ? (
                              <>
                                <Loader2 size={12} className="animate-spin" /> Applying…
                              </>
                            ) : fixState?.status === "done" ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-500" /> Applied
                              </>
                            ) : (
                              <>
                                <Wand2 size={12} /> Apply fix
                              </>
                            )}
                          </button>
                          <Link
                            href={fixHref(website?.id || "", {
                              id: page.id,
                              pageId: page.pageId,
                              pageTitle: page.pageTitle,
                              fixPrompt: page.fixPrompt,
                              title: group.title,
                              description: group.description,
                              impact: group.impact,
                              priority: group.priority,
                              category: group.category,
                              actionLabel: group.actionLabel,
                            })}
                            className="flex items-center gap-1 text-[11px] font-semibold dashboard-muted hover:text-blue-600 dark:hover:text-blue-300"
                          >
                            Open in builder <ArrowRight size={11} />
                          </Link>
                          {fixState?.status === "error" && (
                            <p className="flex w-full items-center gap-1 text-[11px] text-rose-600 dark:text-rose-300">
                              <AlertTriangle size={11} /> {fixState.message}
                            </p>
                          )}
                          {fixState?.status === "needs-input" && (
                            <p className="flex w-full items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300">
                              <AlertTriangle size={11} /> The agent needs more detail — open in builder to continue.
                            </p>
                          )}
                          {fixState?.status === "done" && fixState.message && (
                            <p className="w-full text-[11px] leading-5 dashboard-muted">{fixState.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 shrink-0 border-t dashboard-border bg-[var(--dashboard-bg)] pb-2 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border dashboard-border bg-[var(--dashboard-surface)] p-2 shadow-lg">
          <input
            value={composerText}
            onChange={(event) => setComposerText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder={`Message ${agent.name}…`}
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!composerText.trim() || running || chatLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
          >
            {running || chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setHistoryOpen(false)}>
          <div
            className="dashboard-card max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <History size={17} className="text-blue-500" /> Run history
              </h2>
              <button onClick={() => setHistoryOpen(false)} aria-label="Close" className="rounded-lg p-1.5 dashboard-hover">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {history.length === 0 && (
                <p className="rounded-xl border dashboard-border p-4 text-xs dashboard-muted">
                  No runs yet — message {agent.name} to start building history.
                </p>
              )}
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => void reopenRun(entry)}
                  className="rounded-xl border dashboard-border p-4 text-left dashboard-hover"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.generatedBy === "ai" && (
                      <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300">
                        AI
                      </span>
                    )}
                    <span className="text-[10px] dashboard-faint">
                      {new Date(entry.createdAt).toLocaleString(undefined, { hour12: true })}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 dashboard-muted">{entry.summary}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
