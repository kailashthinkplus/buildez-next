"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Check,
  ChevronRight,
  CircleGauge,
  Gauge,
  Globe2,
  BriefcaseBusiness,
  Loader2,
  MousePointerClick,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Play,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  InsightAgent,
  InsightAgentId,
  InsightFinding,
  InsightReport,
} from "@/modules/insights/types";
import { useWorkspace } from "../../components/WorkspaceContext";
import { AIChannels } from "./AIChannels";

type AgentRun = {
  id: string;
  agent: InsightAgent;
  completedAt: string;
  summary: string;
  actions: InsightFinding[];
};

const agentIcons: Record<InsightAgentId, LucideIcon> = {
  "seo-agent": Search,
  "geo-agent": Globe2,
  "speed-agent": Zap,
  "accessibility-agent": Accessibility,
  "conversion-agent": MousePointerClick,
  "quality-agent": ShieldCheck,
  "business-agent": BriefcaseBusiness,
  "marketing-agent": Megaphone,
  "whatsapp-agent": MessageCircle,
  "chatbot-agent": MessagesSquare,
};

const agentTones: Record<InsightAgentId, string> = {
  "seo-agent": "from-blue-500/20 to-cyan-500/5 text-blue-500",
  "geo-agent": "from-violet-500/20 to-fuchsia-500/5 text-violet-500",
  "speed-agent": "from-amber-500/20 to-orange-500/5 text-amber-500",
  "accessibility-agent": "from-cyan-500/20 to-blue-500/5 text-cyan-500",
  "conversion-agent": "from-emerald-500/20 to-teal-500/5 text-emerald-500",
  "quality-agent": "from-rose-500/20 to-pink-500/5 text-rose-500",
  "business-agent": "from-indigo-500/20 to-blue-500/5 text-indigo-500",
  "marketing-agent": "from-pink-500/20 to-orange-500/5 text-pink-500",
  "whatsapp-agent": "from-emerald-500/20 to-green-500/5 text-emerald-500",
  "chatbot-agent": "from-sky-500/20 to-indigo-500/5 text-sky-500",
};

function fixHref(siteId: string, finding: InsightFinding) {
  const query = new URLSearchParams({
    panel: "ai",
    context: "Page",
    prompt: finding.fixPrompt,
  });
  if (finding.pageId) query.set("pageId", finding.pageId);
  return `/app/builder-v3/${siteId}?${query.toString()}`;
}

export default function AIAgentsPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const { websites, loading: workspaceLoading } = useWorkspace();
  const website = websites.find((item) => item.slug === siteSlug);
  const [agents, setAgents] = useState<InsightAgent[]>([]);
  const [report, setReport] = useState<InsightReport>();
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<InsightAgentId>();
  const [activeRun, setActiveRun] = useState<AgentRun>();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const business = website?.name || siteSlug;

  const load = useCallback(async () => {
    if (!website?.id) {
      setAgents([]);
      setReport(undefined);
      setLoading(workspaceLoading);
      setError(workspaceLoading ? "" : "This website does not belong to the current workspace.");
      return;
    }
    setLoading(true);
    setError("");
    setAgents([]);
    setReport(undefined);
    setActiveRun(undefined);
    try {
      const response = await fetch(
        `/api/sites/${encodeURIComponent(website.id)}/ai-agents`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Your AI team could not be loaded");
      if (payload?.report?.site?.id !== website.id) {
        throw new Error("The AI-agent response did not match this website.");
      }
      setAgents(payload.agents || []);
      setReport(payload.report);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your AI team could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [website?.id, workspaceLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  const recommendedAgent = useMemo(
    () => [...agents].sort((a, b) => a.score - b.score)[0],
    [agents],
  );

  async function runAgent(agentId: InsightAgentId, request = prompt) {
    if (!website?.id || runningId) return;
    setRunningId(agentId);
    setError("");
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
      if (!response.ok) throw new Error(payload?.error || "The agent could not finish");
      setActiveRun(payload.run);
      setPrompt("");
      setAgents((current) =>
        current.map((agent) =>
          agent.id === agentId
            ? { ...agent, lastRunAt: payload.run.completedAt }
            : agent,
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The agent could not finish");
    } finally {
      setRunningId(undefined);
    }
  }

  if (loading && !agents.length) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-500" />
          <p className="mt-3 text-sm dashboard-muted">Bringing your AI team online…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] pb-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {agents.length} specialists active
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.045em]">
            Your AI team for {business}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 dashboard-muted">
            Specialized agents share one source-aware audit, explain what matters,
            and hand approved changes to the visual builder.
          </p>
        </div>
        <Link
          href={`/app/${siteSlug}/insights`}
          className="flex items-center gap-2 rounded-xl border dashboard-border px-4 py-2.5 text-sm font-medium dashboard-hover"
        >
          <CircleGauge size={16} /> Open Insight Center
        </Link>
      </header>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="relative mt-7 overflow-hidden rounded-[28px] border border-blue-300/20 bg-gradient-to-br from-[#081329] via-[#111d3a] to-[#1d1235] p-6 text-white shadow-2xl shadow-blue-950/15 sm:p-8">
        <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
              <Sparkles size={17} /> Ask your AI team
            </div>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">
              From “what should I fix?” to an approved builder action.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
              Describe the outcome you want. BuildEZ routes it to the right
              specialist and grounds the response in your current website.
            </p>
            <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-2.5 backdrop-blur-xl sm:flex-row">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && recommendedAgent) {
                    void runAgent(recommendedAgent.id);
                  }
                }}
                placeholder="For example: What is stopping this website from ranking and converting?"
                className="min-h-16 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-white/30"
              />
              <button
                onClick={() => recommendedAgent && void runAgent(recommendedAgent.id)}
                disabled={!prompt.trim() || Boolean(runningId) || !recommendedAgent}
                className="flex h-11 shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
              >
                {runningId ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Ask team
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeroMetric
              label="Website health"
              value={`${report?.score ?? "—"}`}
              help="shared score"
              icon={Gauge}
            />
            <HeroMetric
              label="Priority actions"
              value={`${report?.stats.highPriority ?? "—"}`}
              help="need attention"
              icon={Zap}
            />
            <HeroMetric
              label="Checks passed"
              value={`${report?.stats.checksPassed ?? "—"}`}
              help={`of ${report?.stats.checksTotal ?? "—"}`}
              icon={Check}
            />
            <HeroMetric
              label="Pages covered"
              value={`${report?.stats.pagesAudited ?? "—"}`}
              help="current audit"
              icon={Globe2}
            />
          </div>
        </div>
      </section>

      {activeRun && (
        <section className="mt-5 rounded-2xl border border-blue-300/30 bg-blue-500/[.07] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
              <Check size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{activeRun.agent.name} completed the run</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                  Ready for review
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 dashboard-muted">{activeRun.summary}</p>
            </div>
            <button
              onClick={() => setActiveRun(undefined)}
              aria-label="Close agent result"
              className="rounded-lg p-2 dashboard-muted dashboard-hover"
            >
              <X size={16} />
            </button>
          </div>
          {activeRun.actions.length > 0 && (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {activeRun.actions.map((action) => (
                <div key={action.id} className="rounded-xl border dashboard-border bg-[var(--dashboard-surface)] p-4">
                  <div className="flex items-center gap-2">
                    <Priority priority={action.priority} />
                    <span className="text-[10px] dashboard-faint">{action.pageTitle}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{action.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 dashboard-muted">{action.description}</p>
                  <Link
                    href={fixHref(website?.id || "", action)}
                    className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300"
                  >
                    Review in builder <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <div>
          <h2 className="text-lg font-semibold">Specialist agents</h2>
          <p className="mt-1 text-xs dashboard-muted">
            Run one specialist or ask the team to route a goal automatically.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              running={runningId === agent.id}
              onRun={() => void runAgent(agent.id)}
            />
          ))}
        </div>
      </section>

      {website?.id && <AIChannels siteId={website.id} />}

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <article className="dashboard-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <WandSparkles size={17} className="text-violet-500" /> Recommended next run
              </h2>
              <p className="mt-1 text-xs dashboard-muted">
                Chosen from the lowest-scoring specialist area.
              </p>
            </div>
            {recommendedAgent && <Score score={recommendedAgent.score} />}
          </div>
          {recommendedAgent && (
            <div className="mt-5 flex flex-col gap-4 rounded-xl bg-black/[.025] p-4 dark:bg-white/[.035] sm:flex-row sm:items-center">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${agentTones[recommendedAgent.id]}`}>
                {(() => {
                  const Icon = agentIcons[recommendedAgent.id];
                  return <Icon size={19} />;
                })()}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{recommendedAgent.name}</h3>
                <p className="mt-1 text-xs leading-5 dashboard-muted">
                  {recommendedAgent.description}
                </p>
              </div>
              <button
                onClick={() => void runAgent(recommendedAgent.id)}
                disabled={Boolean(runningId)}
                className="ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-45"
              >
                <Play size={13} /> Run agent
              </button>
            </div>
          )}
        </article>

        <Link
          href={`/app/${siteSlug}/insights`}
          className="dashboard-card group rounded-2xl p-5 sm:p-6 dashboard-hover"
        >
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
              <CircleGauge size={20} />
            </span>
            <ChevronRight className="dashboard-faint transition group-hover:translate-x-1" size={18} />
          </div>
          <h2 className="mt-5 font-semibold">Explore the complete audit</h2>
          <p className="mt-2 text-xs leading-5 dashboard-muted">
            Compare every page, run a live PageSpeed test, and filter improvements by specialty.
          </p>
        </Link>
      </section>
    </div>
  );
}

function AgentCard({
  agent,
  running,
  onRun,
}: {
  agent: InsightAgent;
  running: boolean;
  onRun: () => void;
}) {
  const Icon = agentIcons[agent.id];
  return (
    <article className="dashboard-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${agentTones[agent.id]}`}>
          <Icon size={19} />
        </span>
        <Status status={agent.status} />
      </div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">{agent.role}</p>
      <h3 className="mt-1 font-semibold">{agent.name}</h3>
      <p className="mt-2 min-h-10 text-xs leading-5 dashboard-muted">{agent.description}</p>
      <div className="mt-5 flex items-center gap-3 border-t dashboard-border pt-4">
        <Score score={agent.score} />
        <span className="text-[11px] dashboard-muted">
          {agent.opportunityCount} opportunit{agent.opportunityCount === 1 ? "y" : "ies"}
        </span>
        <button
          onClick={onRun}
          disabled={running}
          className="ml-auto flex items-center gap-1.5 rounded-lg border dashboard-border px-3 py-2 text-xs font-semibold dashboard-hover disabled:opacity-45"
        >
          {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
          {running ? "Running" : "Run"}
        </button>
      </div>
    </article>
  );
}

function HeroMetric({
  label,
  value,
  help,
  icon: Icon,
}: {
  label: string;
  value: string;
  help: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-xl">
      <Icon size={16} className="text-blue-300" />
      <strong className="mt-4 block text-2xl">{value}</strong>
      <p className="mt-1 text-xs font-medium">{label}</p>
      <p className="mt-0.5 text-[10px] text-white/35">{help}</p>
    </div>
  );
}

function Status({ status }: { status: InsightAgent["status"] }) {
  const style =
    status === "ready"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
      : status === "attention"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-300";
  return (
    <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${style}`}>
      {status === "attention" ? "Needs attention" : status}
    </span>
  );
}

function Score({ score }: { score: number }) {
  const style =
    score >= 90
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
      : score >= 70
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{score}/100</span>;
}

function Priority({ priority }: { priority: InsightFinding["priority"] }) {
  const style =
    priority === "high"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
      : priority === "medium"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
        : "bg-slate-500/10 dashboard-muted";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style}`}>
      {priority}
    </span>
  );
}
