import type {
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy as SdkContentStrategy,
  EngineWarning,
  JsonValue,
  MissingFact,
  WebsiteIntentClassification,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";

export type { SdkContentStrategy as ContentStrategy };

/**
 * Inputs accepted by the deterministic Content Intelligence Engine.
 *
 * @example
 * const input: ContentIntelligenceInput = { knownFacts: {}, missingFacts: [] };
 */
export type ContentIntelligenceInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  businessContext?: BusinessContext;
  intent?: WebsiteIntentClassification;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  knownFacts?: Record<string, JsonValue>;
  missingFacts?: readonly MissingFact[];
}>;

/**
 * Ordered strategic message requirements, not final copy.
 *
 * @example
 * const hierarchy: MessageHierarchy = { messages: ["trust", "offer", "CTA"], confidence: 0.7, evidence: [] };
 */
export type MessageHierarchy = Readonly<{
  messages: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Headline strategy guidance without writing the headline.
 *
 * @example
 * const strategy: HeadlineStrategy = { strategy: "lead with care category and trust", confidence: 0.7, evidence: [] };
 */
export type HeadlineStrategy = Readonly<{
  strategy: string;
  confidence: number;
  evidence: string[];
}>;

/**
 * Role assigned to a future section.
 *
 * @example
 * const role: SectionMessagingRole = { section: "hero", role: "set context" };
 */
export type SectionMessagingRole = Readonly<{
  section: string;
  role: string;
}>;

/**
 * CTA strategy requirements without final CTA copywriting.
 *
 * @example
 * const cta: CTAStrategy = { actions: ["appointment CTA"], confidence: 0.8, evidence: [] };
 */
export type CTAStrategy = Readonly<{
  actions: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Proof strategy requirements.
 *
 * @example
 * const proof: ProofStrategy = { requirements: ["credentials if provided"], confidence: 0.7, evidence: [] };
 */
export type ProofStrategy = Readonly<{
  requirements: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * FAQ strategy requirements.
 *
 * @example
 * const faq: FAQStrategy = { topics: ["hours"], confidence: 0.7, evidence: [] };
 */
export type FAQStrategy = Readonly<{
  topics: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * SEO content strategy requirements without keyword stuffing.
 *
 * @example
 * const seo: SEOContentStrategy = { topics: ["service area"], confidence: 0.7, evidence: [] };
 */
export type SEOContentStrategy = Readonly<{
  topics: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Trust copy rules for future copywriting.
 *
 * @example
 * const trust: TrustCopyStrategy = { rules: ["credentials only if provided"], confidence: 0.8, evidence: [] };
 */
export type TrustCopyStrategy = Readonly<{
  rules: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Objection handling strategy requirements.
 *
 * @example
 * const objection: ObjectionHandlingStrategy = { objections: ["availability"], confidence: 0.7, evidence: [] };
 */
export type ObjectionHandlingStrategy = Readonly<{
  objections: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Locality content requirements.
 *
 * @example
 * const locality: LocalityContentStrategy = { requirements: ["address if provided"], confidence: 0.7, evidence: [] };
 */
export type LocalityContentStrategy = Readonly<{
  requirements: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Truth policy that constrains future copywriting.
 *
 * @example
 * const policy: ContentTruthPolicy = { rules: ["missing facts stay missing"], confidence: 1, evidence: [] };
 */
export type ContentTruthPolicy = Readonly<{
  rules: string[];
  confidence: number;
  evidence: string[];
}>;

/**
 * Missing content fact preserved as an explicit unknown.
 *
 * @example
 * const fact: MissingContentFact = { id: "menu", label: "Menu", required: true, reason: "Menu strategy needs items" };
 */
export type MissingContentFact = MissingFact;

/**
 * Content confidence score and rationale.
 *
 * @example
 * const confidence: ContentConfidence = { score: 0.72, reasons: ["business profile provided"] };
 */
export type ContentConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Content Intelligence execution metrics.
 *
 * @example
 * const metrics: ContentMetrics = { missingFactCount: 2, evidenceCount: 8, messageCount: 5, repositoryRecordCount: 0, graphNodeCount: 0, graphEdgeCount: 0, warningCount: 1 };
 */
export type ContentMetrics = Readonly<{
  missingFactCount: number;
  evidenceCount: number;
  messageCount: number;
  repositoryRecordCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  warningCount: number;
}>;

/**
 * Content Intelligence warning using the SDK warning shape.
 *
 * @example
 * const warning: ContentWarning = { code: "LOW_CONTENT_CONFIDENCE", message: "More facts needed", severity: "minor", module: "content-intelligence" };
 */
export type ContentWarning = EngineWarning;

/**
 * Content family context resolved from business, intent, or context.
 *
 * @example
 * const context: ContentFamilyContext = { family: "healthcare", evidence: ["businessProfile"] };
 */
export type ContentFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
}>;

/**
 * Resolves business family context for content strategy.
 *
 * @example
 * const family = resolveContentFamilyContext(input);
 */
export function resolveContentFamilyContext(input: ContentIntelligenceInput): ContentFamilyContext {
  if (input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown") {
    return Object.freeze({ family: input.businessProfile.businessFamily, evidence: ["businessProfile.businessFamily"] });
  }
  if (input.businessContext?.family && input.businessContext.family !== "unknown") {
    return Object.freeze({ family: input.businessContext.family, evidence: ["businessContext.family"] });
  }
  if (input.intent?.businessFamily && input.intent.businessFamily !== "unknown") {
    return Object.freeze({ family: input.intent.businessFamily, evidence: ["intent.businessFamily"] });
  }

  const text = JSON.stringify({
    brand: input.brandProfile?.storyAngle,
    business: input.businessProfile?.identity.summary,
    hints: input.knownFacts,
  }).toLowerCase();
  const keywordMap: Array<[BusinessFamily | "government", string[]]> = [
    ["healthcare", ["clinic", "healthcare", "hospital", "doctor"]],
    ["real_estate", ["real estate", "property", "apartment", "site visit"]],
    ["food_and_beverage", ["restaurant", "menu", "cafe", "reservation"]],
    ["automotive", ["automotive", "vehicle", "car", "test drive"]],
    ["education", ["education", "school", "course", "admissions"]],
    ["ecommerce_d2c", ["d2c", "ecommerce", "product", "shipping"]],
    ["hospitality", ["hotel", "resort", "stay", "rooms"]],
    ["architecture_interiors", ["interior", "architecture", "portfolio"]],
    ["government", ["government", "public sector", "civic"]],
  ];
  const matched = keywordMap.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return Object.freeze({ family: matched?.[0] ?? "unknown", evidence: matched ? [`keyword.${matched[0]}`] : ["fallback.unknown"] });
}
