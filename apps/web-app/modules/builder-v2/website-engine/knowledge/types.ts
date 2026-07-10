import type { WebsiteIndustry } from "../planner";

export type KnowledgeNodeKind =
  | "industry"
  | "archetype"
  | "section"
  | "component"
  | "conversion"
  | "design"
  | "asset";

export type KnowledgeEdgeKind =
  | "requires"
  | "supports"
  | "forbids"
  | "inherits"
  | "prefers"
  | "uses";

export type KnowledgeNode = {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  industry?: WebsiteIndustry;
  metadata?: Record<string, unknown>;
};

export type KnowledgeEdge = {
  from: string;
  to: string;
  kind: KnowledgeEdgeKind;
  weight?: number;
  reason?: string;
};

export type KnowledgeGraph = {
  id: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

export type IndustryKnowledge = {
  industry: WebsiteIndustry;
  archetypes: string[];
  requiredSections: string[];
  optionalSections: string[];
  forbiddenPatterns: string[];
  trustSignals: string[];
  conversionRules: string[];
  designRules: string[];
  imageRules: string[];
};
