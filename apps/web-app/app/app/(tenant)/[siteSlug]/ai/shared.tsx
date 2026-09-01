import {
  Accessibility,
  BriefcaseBusiness,
  Globe2,
  MousePointerClick,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Search,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { InsightAgent, InsightAgentId, InsightFinding } from "@/modules/insights/types";

export type AgentRun = {
  id: string;
  agent: InsightAgent;
  completedAt: string;
  summary: string;
  generatedBy?: "ai" | "analytics";
  actions: InsightFinding[];
  prompt?: string;
};

export type RunHistoryEntry = {
  id: string;
  agentId: InsightAgentId;
  prompt: string | null;
  summary: string;
  generatedBy: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export const agentIcons: Record<InsightAgentId, LucideIcon> = {
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

export const agentTones: Record<InsightAgentId, string> = {
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

export function fixHref(siteId: string, finding: InsightFinding) {
  const query = new URLSearchParams({
    panel: "ai",
    context: "Page",
    prompt: finding.fixPrompt,
    autorun: "1",
  });
  if (finding.pageId) query.set("pageId", finding.pageId);
  return `/app/builder-v3/${siteId}?${query.toString()}`;
}

export function Status({ status }: { status: InsightAgent["status"] }) {
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

export function Score({ score }: { score: number }) {
  const style =
    score >= 90
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
      : score >= 70
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>{score}/100</span>;
}

export function Priority({ priority }: { priority: InsightFinding["priority"] }) {
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

export function HeroMetric({
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
