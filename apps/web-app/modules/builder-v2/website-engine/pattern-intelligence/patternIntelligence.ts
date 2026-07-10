import type {
  BrandIntelligenceProfile,
  BusinessContext,
  BusinessFamily,
  BusinessIntelligenceProfile,
  ContentStrategy,
  EngineWarning,
  ExperienceStrategy,
  JsonValue,
  MissingFact,
  PatternDecision,
  PatternIntelligenceResult as SdkPatternIntelligenceResult,
  WebsiteArchetypeId,
  WebsiteIntentClassification,
} from "../sdk";
import type { ConstraintEvaluationResult } from "../constraints";
import type { DecisionPlan } from "../decision";
import type { GraphEdge, GraphNode } from "../graph";
import type { ReasoningCandidate } from "../reasoning";
import type { RepositoryRecord } from "../repository";

export type { SdkPatternIntelligenceResult as PatternIntelligenceResult, PatternDecision };

/**
 * Inputs accepted by deterministic local Pattern Intelligence.
 *
 * @example
 * const input: PatternIntelligenceInput = { knownFacts: {}, missingFacts: [] };
 */
export type PatternIntelligenceInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  intent?: WebsiteIntentClassification;
  businessContext?: BusinessContext;
  repositoryRecords?: readonly RepositoryRecord[];
  graphNodes?: readonly GraphNode[];
  graphEdges?: readonly GraphEdge[];
  reasoningCandidates?: readonly ReasoningCandidate[];
  decisionPlan?: DecisionPlan;
  constraintResult?: ConstraintEvaluationResult;
  knownFacts?: Record<string, JsonValue>;
  missingFacts?: readonly MissingFact[];
}>;

/**
 * Semantic pattern category. These are not templates.
 *
 * @example
 * const category: PatternCategory = "hero";
 */
export type PatternCategory =
  | "hero" | "trust" | "proof" | "CTA" | "gallery" | "storytelling" | "locality" | "menu"
  | "booking" | "appointment" | "catalogue" | "product" | "service" | "portfolio"
  | "process" | "comparison" | "pricing" | "FAQ" | "testimonial" | "team"
  | "founder-story" | "case-study" | "community" | "event" | "donation" | "investor"
  | "documentation" | "blog/media" | "footer" | "navigation" | "conversion-block"
  | "lead-capture" | "sticky-action";

/**
 * Semantic role a pattern plays in the journey.
 *
 * @example
 * const role: PatternRole = "conversion";
 */
export type PatternRole =
  | "orientation"
  | "trust-building"
  | "proof"
  | "conversion"
  | "exploration"
  | "objection-handling"
  | "locality"
  | "story"
  | "closure";

/**
 * Reusable local pattern definition.
 *
 * @example
 * const patternId = definition.id;
 */
export type PatternDefinition = Readonly<{
  id: string;
  name: string;
  category: PatternCategory;
  role: PatternRole;
  reusable: boolean;
  compatibleFamilies: Array<BusinessFamily | "government">;
  compatibleArchetypes: WebsiteArchetypeId[];
  tags: string[];
  requiredFacts: string[];
  requiredAssets: string[];
  conversionImpact: string[];
  trustImpact: string[];
  seoImpact: string[];
  accessibilityNotes: string[];
  mobileBehavior: string[];
  risks: string[];
  conflictsWith: string[];
}>;

/**
 * Pattern score broken into deterministic dimensions.
 *
 * @example
 * const score: PatternScore = { businessFit: 0.8, brandFit: 0.7, contentFit: 0.7, experienceFit: 0.8, constraintFit: 1, overall: 0.8 };
 */
export type PatternScore = Readonly<{
  businessFit: number;
  brandFit: number;
  contentFit: number;
  experienceFit: number;
  constraintFit: number;
  overall: number;
}>;

/**
 * Ranked pattern candidate.
 *
 * @example
 * const candidate: PatternCandidate = { definition, score, reasons: [] };
 */
export type PatternCandidate = Readonly<{
  definition: PatternDefinition;
  score: PatternScore;
  reasons: string[];
  risks: string[];
}>;

/**
 * Recommended semantic pattern set.
 *
 * @example
 * const set: PatternSet = { id: "set", patternIds: [], purpose: "journey", confidence: 0.8 };
 */
export type PatternSet = Readonly<{
  id: string;
  patternIds: string[];
  purpose: string;
  confidence: number;
}>;

/**
 * Suggested semantic pattern sequence.
 *
 * @example
 * const sequence: PatternSequence = { patternIds: ["editorial_hero"], rationale: [] };
 */
export type PatternSequence = Readonly<{
  patternIds: string[];
  rationale: string[];
}>;

/**
 * Compatibility note for a pattern.
 *
 * @example
 * const compatibility: PatternCompatibility = { patternId: "trust_band", compatible: true, notes: [] };
 */
export type PatternCompatibility = Readonly<{
  patternId: string;
  compatible: boolean;
  notes: string[];
}>;

/**
 * Conflict between semantic patterns.
 *
 * @example
 * const conflict: PatternConflict = { patternIds: ["a", "b"], severity: "minor", reason: "duplicate role" };
 */
export type PatternConflict = Readonly<{
  patternIds: string[];
  severity: "minor" | "major";
  reason: string;
}>;

/**
 * Explanation for one pattern candidate.
 *
 * @example
 * const explanation: PatternExplanation = { patternId: "service_matrix", reasons: [], evidence: [], risks: [] };
 */
export type PatternExplanation = Readonly<{
  patternId: string;
  reasons: string[];
  evidence: string[];
  risks: string[];
}>;

/**
 * Fallback pattern when confidence is low or facts are missing.
 *
 * @example
 * const fallback: PatternFallback = { patternId: "faq_objection_handling", reason: "Missing proof" };
 */
export type PatternFallback = Readonly<{
  patternId: string;
  reason: string;
}>;

/**
 * Pattern confidence score and rationale.
 *
 * @example
 * const confidence: PatternConfidence = { score: 0.72, reasons: [] };
 */
export type PatternConfidence = Readonly<{
  score: number;
  reasons: string[];
}>;

/**
 * Pattern Intelligence execution metrics.
 *
 * @example
 * const metrics: PatternMetrics = { candidateCount: 10, selectedCount: 5, rejectedCount: 2, conflictCount: 1, warningCount: 0 };
 */
export type PatternMetrics = Readonly<{
  candidateCount: number;
  selectedCount: number;
  rejectedCount: number;
  conflictCount: number;
  warningCount: number;
}>;

/** Pattern Intelligence warning using the SDK warning shape. */
export type PatternWarning = EngineWarning;

/**
 * Resolved family context for pattern reasoning.
 *
 * @example
 * const context: PatternFamilyContext = { family: "real_estate", evidence: [] };
 */
export type PatternFamilyContext = Readonly<{
  family: BusinessFamily | "government";
  archetypes: WebsiteArchetypeId[];
  evidence: string[];
}>;

/**
 * Resolves business family and archetype hints for pattern reasoning.
 *
 * @example
 * const context = resolvePatternFamilyContext(input);
 */
export function resolvePatternFamilyContext(input: PatternIntelligenceInput): PatternFamilyContext {
  const family =
    input.businessProfile?.businessFamily && input.businessProfile.businessFamily !== "unknown"
      ? input.businessProfile.businessFamily
      : input.businessContext?.family && input.businessContext.family !== "unknown"
        ? input.businessContext.family
        : input.intent?.businessFamily && input.intent.businessFamily !== "unknown"
          ? input.intent.businessFamily
          : "unknown";
  const archetypes = input.intent?.archetypeHints?.length
    ? input.intent.archetypeHints
    : input.decisionPlan?.selectedArchetype && input.decisionPlan.selectedArchetype !== "unknown"
      ? [input.decisionPlan.selectedArchetype as WebsiteArchetypeId]
      : ["lead_generation"];

  return Object.freeze({
    family,
    archetypes,
    evidence: [
      ...(input.businessProfile ? ["businessProfile.businessFamily"] : []),
      ...(input.intent?.archetypeHints?.length ? ["intent.archetypeHints"] : []),
      ...(input.decisionPlan ? ["decisionPlan.selectedArchetype"] : []),
    ],
  });
}
