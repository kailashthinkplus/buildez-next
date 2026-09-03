"use client";

import { useEffect, useState } from "react";
import { Gauge, Lightbulb, Loader2, TrendingUp } from "lucide-react";

import type { InsightAgentId, InsightReport, WebVitalMetric } from "@/modules/insights/types";
import { getAgentFindings } from "@/modules/insights/insightEngine";
import { AIChannels } from "../AIChannels";

type CrmInsight = { title: string; insight: string; action: string };

function ratingStyle(rating: WebVitalMetric["rating"]) {
  return rating === "good"
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
    : rating === "needs-improvement"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-300";
}

function WebVitalsPanel({ vitals }: { vitals: WebVitalMetric[] }) {
  return (
    <section className="dashboard-card mt-6 rounded-2xl p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Gauge size={17} className="text-amber-500" /> Core Web Vitals
      </h2>
      <p className="mt-1 text-xs dashboard-muted">Modeled from your site's current build, matching how Google measures real visits.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {vitals.map((vital) => (
          <div key={vital.id} className="rounded-xl border dashboard-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{vital.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${ratingStyle(vital.rating)}`}>
                {vital.rating.replace("-", " ")}
              </span>
            </div>
            <strong className="mt-3 block text-xl">{vital.displayValue}</strong>
            <p className="mt-1 text-[11px] leading-5 dashboard-muted">{vital.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BusinessIntelligencePanel({ siteId }: { siteId: string }) {
  const [insights, setInsights] = useState<CrmInsight[]>();
  const [generatedBy, setGeneratedBy] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/crm/insights?siteId=${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setInsights(payload.insights || []);
        setGeneratedBy(payload.generatedBy);
      })
      .catch(() => active && setInsights([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [siteId]);

  return (
    <section className="dashboard-card mt-6 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp size={17} className="text-indigo-500" /> Pipeline intelligence
        </h2>
        {generatedBy === "ai" && (
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300">
            AI generated
          </span>
        )}
      </div>
      <p className="mt-1 text-xs dashboard-muted">Live signal from your CRM leads, not just the website audit.</p>
      {loading ? (
        <div className="mt-6 grid place-items-center py-6">
          <Loader2 className="animate-spin text-blue-500" size={18} />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(insights || []).map((item, index) => (
            <div key={index} className="rounded-xl border dashboard-border p-4">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 dashboard-muted">{item.insight}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">{item.action}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MarketingIdeasPanel({ report }: { report?: InsightReport }) {
  // report.quickWins spans every audit category (including performance,
  // accessibility and best-practices, which marketing has no declared
  // context for). Scope to marketing's own source categories so this
  // panel never surfaces findings from a category marketing isn't
  // supposed to speak for.
  const marketingWins = report
    ? getAgentFindings(report, "marketing-agent").filter((finding) => finding.priority !== "low")
    : [];
  if (!marketingWins.length) return null;
  return (
    <section className="dashboard-card mt-6 rounded-2xl p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <Lightbulb size={17} className="text-pink-500" /> Quick campaign wins
      </h2>
      <p className="mt-1 text-xs dashboard-muted">The fastest wins across SEO, discovery and conversion, useful as this week's marketing to-dos.</p>
      <ul className="mt-4 flex flex-col gap-2">
        {marketingWins.slice(0, 5).map((item) => (
          <li key={item.id} className="rounded-xl border dashboard-border px-4 py-3 text-xs leading-5 dashboard-muted">
            <span className="font-semibold text-[var(--dashboard-text,inherit)]">{item.title}</span> — {item.impact}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AgentFunctionality({
  agentId,
  siteId,
  report,
}: {
  agentId: InsightAgentId;
  siteId: string;
  report?: InsightReport;
}) {
  if (agentId === "speed-agent" && report?.vitals.length) {
    return <WebVitalsPanel vitals={report.vitals} />;
  }
  if (agentId === "business-agent") {
    return <BusinessIntelligencePanel siteId={siteId} />;
  }
  if (agentId === "marketing-agent") {
    return <MarketingIdeasPanel report={report} />;
  }
  if (agentId === "whatsapp-agent") {
    return <AIChannels siteId={siteId} only="whatsapp" />;
  }
  if (agentId === "chatbot-agent") {
    return <AIChannels siteId={siteId} only="chatbot" />;
  }
  return null;
}
