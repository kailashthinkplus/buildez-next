import type {
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy as SdkExperienceStrategy,
  JsonValue,
  MissingFact,
  WebsiteIntentClassification,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";

export type { SdkExperienceStrategy as ExperienceStrategy };

/**
 * Inputs accepted by the deterministic local Experience Engine.
 *
 * @example
 * const input: ExperienceInput = { knownFacts: {}, missingFacts: [] };
 */
export type ExperienceInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  businessContext?: BusinessContext;
  intent?: WebsiteIntentClassification;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  constraintResult?: ConstraintEvaluationResult;
  knownFacts?: Record<string, JsonValue>;
  missingFacts?: readonly MissingFact[];
}>;

/** Journey stage contract. @example const stage: JourneyStage = "trust"; */
export type JourneyStage = string;

/** Attention curve item. @example const curve: AttentionCurve = ["strong hero"]; */
export type AttentionCurve = string[];

/** Trust curve item. @example const curve: TrustCurve = ["proof before CTA"]; */
export type TrustCurve = string[];

/** CTA cadence item. @example const cadence: CTACadence = ["early soft CTA"]; */
export type CTACadence = string[];

/** Proof placement item. @example const proof: ProofPlacement = ["before form"]; */
export type ProofPlacement = string[];

/** Content density curve. @example const density: ContentDensityCurve = ["low", "medium"]; */
export type ContentDensityCurve = string[];

/** Media rhythm. @example const rhythm: MediaRhythm = ["hero media", "proof media"]; */
export type MediaRhythm = string[];

/** Interaction rhythm. @example const rhythm: InteractionRhythm = ["low motion"]; */
export type InteractionRhythm = string[];

/** Scroll narrative. @example const narrative: ScrollNarrative = ["why", "what", "act"]; */
export type ScrollNarrative = string[];

/** Mobile journey. @example const mobile: MobileJourney = ["CTA reachable early"]; */
export type MobileJourney = string[];

/** Conversion friction point. @example const point: ConversionFrictionPoint = "availability"; */
export type ConversionFrictionPoint = string;

/**
 * Experience confidence score and rationale.
 *
 * @example
 * const confidence: ExperienceConfidence = { score: 0.72, reasons: ["content strategy provided"] };
 */
export type ExperienceConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Experience Engine execution metrics.
 *
 * @example
 * const metrics: ExperienceMetrics = { stageCount: 4, frictionPointCount: 2, evidenceCount: 8, repositoryRecordCount: 0, graphNodeCount: 0, graphEdgeCount: 0, warningCount: 1 };
 */
export type ExperienceMetrics = Readonly<{
  stageCount: number;
  frictionPointCount: number;
  evidenceCount: number;
  repositoryRecordCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  warningCount: number;
}>;

/**
 * Experience warning using the SDK warning shape.
 *
 * @example
 * const warning: ExperienceWarning = { code: "LOW_EXPERIENCE_CONFIDENCE", message: "More journey facts needed", severity: "minor", module: "experience" };
 */
export type ExperienceWarning = EngineWarning;

/**
 * Resolved family context for experience modeling.
 *
 * @example
 * const context: ExperienceFamilyContext = { family: "healthcare", evidence: ["businessProfile"] };
 */
export type ExperienceFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  evidence: string[];
}>;

/**
 * Resolves business family context for experience strategy.
 *
 * @example
 * const family = resolveExperienceFamilyContext(input);
 */
export function resolveExperienceFamilyContext(input: ExperienceInput): ExperienceFamilyContext {
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
    content: input.contentStrategy?.messageHierarchy,
    brand: input.brandProfile?.storyAngle,
    business: input.businessProfile?.identity.summary,
    knownFacts: input.knownFacts,
  }).toLowerCase();
  const keywordMap: Array<[BusinessFamily | "government", string[]]> = [
    ["healthcare", ["clinic", "healthcare", "appointment"]],
    ["real_estate", ["real estate", "property", "site visit"]],
    ["food_and_beverage", ["restaurant", "menu", "reservation"]],
    ["automotive", ["automotive", "inventory", "test-drive", "test drive"]],
    ["education", ["education", "program", "admissions"]],
    ["ecommerce_d2c", ["product", "shipping", "purchase"]],
    ["hospitality", ["hotel", "resort", "booking"]],
    ["architecture_interiors", ["interior", "portfolio", "design process"]],
    ["government", ["government", "public sector", "service access"]],
  ];
  const matched = keywordMap.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return Object.freeze({ family: matched?.[0] ?? "unknown", evidence: matched ? [`keyword.${matched[0]}`] : ["fallback.unknown"] });
}
