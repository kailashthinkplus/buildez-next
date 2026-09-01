"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleGauge,
  Gauge,
  Globe2,
  Loader2,
  Play,
  Send,
  Sparkles,
  WandSparkles,
  Zap,
  History,
  Bot,
} from "lucide-react";

import type { InsightAgent, InsightAgentId, InsightReport } from "@/modules/insights/types";
import { useWorkspace } from "../../components/WorkspaceContext";
import { AIChannels } from "./AIChannels";
import { agentIcons, agentTones, HeroMetric, Score, Status, type RunHistoryEntry } from "./shared";

export default function AIAgentsPage() {
  const { siteSlug } = useParams<{ siteSlug: string }>();
  const router = useRouter();
  const { websites, loading: workspaceLoading } = useWorkspace();
  const website = websites.find((item) => item.slug === siteSlug);
  const [agents, setAgents] = useState<InsightAgent[]>([]);
  const [report, setReport] = useState<InsightReport>();
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
      setRunHistory(payload.recentRuns || []);
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

  function openAgent(agentId: InsightAgentId, withPrompt?: string) {
    const query = withPrompt?.trim() ? `?prompt=${encodeURIComponent(withPrompt.trim())}` : "";
    router.push(`/app/${siteSlug}/ai/${agentId}${query}`);
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
                    openAgent(recommendedAgent.id, prompt);
                  }
                }}
                placeholder="For example: What is stopping this website from ranking and converting?"
                className="min-h-16 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-white/30"
              />
              <button
                onClick={() => recommendedAgent && openAgent(recommendedAgent.id, prompt)}
                disabled={!prompt.trim() || !recommendedAgent}
                className="flex h-11 shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
              >
                <Send size={16} />
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

      <section className="mt-8">
        <div>
          <h2 className="text-lg font-semibold">Specialist agents</h2>
          <p className="mt-1 text-xs dashboard-muted">
            Open a specialist to run it, review every finding, and ask follow-up questions.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} siteSlug={String(siteSlug)} />
          ))}
        </div>
      </section>

      {runHistory.length > 0 && (
        <section className="mt-8">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <History size={17} className="text-blue-500" /> Recent activity
            </h2>
            <p className="mt-1 text-xs dashboard-muted">
              Past runs from your AI team, saved so you can pick up a conversation later.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {runHistory.slice(0, 8).map((entry) => {
              const Icon = agentIcons[entry.agentId] || Bot;
              const agentName = agents.find((item) => item.id === entry.agentId)?.name || entry.agentId;
              return (
                <Link
                  key={entry.id}
                  href={`/app/${siteSlug}/ai/${entry.agentId}?run=${encodeURIComponent(entry.id)}`}
                  className="dashboard-card flex items-start gap-3 rounded-xl p-4 text-left dashboard-hover"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${agentTones[entry.agentId]}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{agentName}</h3>
                      {entry.generatedBy === "ai" && (
                        <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300">
                          AI
                        </span>
                      )}
                      <span className="text-[10px] dashboard-faint">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 dashboard-muted">{entry.summary}</p>
                  </div>
                  <ChevronRight className="mt-1 shrink-0 dashboard-faint" size={16} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
                onClick={() => openAgent(recommendedAgent.id)}
                className="ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white"
              >
                <Play size={13} /> Open agent
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

function AgentCard({ agent, siteSlug }: { agent: InsightAgent; siteSlug: string }) {
  const Icon = agentIcons[agent.id];
  return (
    <Link href={`/app/${siteSlug}/ai/${agent.id}`} className="dashboard-card block rounded-2xl p-5 dashboard-hover">
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
        <span className="ml-auto flex items-center gap-1.5 rounded-lg border dashboard-border px-3 py-2 text-xs font-semibold">
          <Play size={13} /> Open
        </span>
      </div>
    </Link>
  );
}
