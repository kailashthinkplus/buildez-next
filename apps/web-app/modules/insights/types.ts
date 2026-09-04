export type InsightCategoryId =
  | "seo"
  | "geo"
  | "performance"
  | "accessibility"
  | "conversion"
  | "best-practices";

export type InsightPriority = "high" | "medium" | "low";
export type InsightRating = "good" | "needs-improvement" | "poor";

export type InsightFinding = Readonly<{
  id: string;
  category: InsightCategoryId;
  title: string;
  description: string;
  impact: string;
  priority: InsightPriority;
  pageId?: string;
  pageTitle?: string;
  actionLabel: string;
  fixPrompt: string;
}>;

export type InsightCategory = Readonly<{
  id: InsightCategoryId;
  label: string;
  shortLabel: string;
  score: number;
  summary: string;
  checksPassed: number;
  checksTotal: number;
}>;

export type WebVitalMetric = Readonly<{
  id: "lcp" | "inp" | "cls" | "fcp" | "tbt" | "speed-index";
  label: string;
  value: number;
  displayValue: string;
  rating: InsightRating;
  description: string;
  source: "modeled" | "pagespeed";
}>;

export type InsightPageSummary = Readonly<{
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  score: number;
  issueCount: number;
}>;

export type InsightReport = Readonly<{
  generatedAt: string;
  source: "source-audit" | "pagespeed";
  scope: "site" | "page";
  site: { id: string; name: string; slug: string; status: string };
  page?: { id: string; title: string; slug: string; status: string };
  score: number;
  summary: string;
  categories: InsightCategory[];
  findings: InsightFinding[];
  quickWins: InsightFinding[];
  vitals: WebVitalMetric[];
  pages: InsightPageSummary[];
  stats: {
    highPriority: number;
    opportunities: number;
    pagesAudited: number;
    checksPassed: number;
    checksTotal: number;
  };
}>;

export type InsightAgentId =
  | "seo-agent"
  | "geo-agent"
  | "speed-agent"
  | "accessibility-agent"
  | "conversion-agent"
  | "quality-agent"
  | "business-agent"
  | "marketing-agent"
  | "whatsapp-agent"
  | "chatbot-agent";

export type InsightAgentCategory =
  | InsightCategoryId
  | "business"
  | "marketing"
  | "whatsapp"
  | "chatbot";

export type InsightAgent = Readonly<{
  id: InsightAgentId;
  name: string;
  role: string;
  description: string;
  category: InsightAgentCategory;
  status: "monitoring" | "attention" | "ready";
  score: number;
  opportunityCount: number;
  lastRunAt: string;
}>;
