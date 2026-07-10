import type {
  BrandIntelligenceProfile,
  BusinessIntelligenceProfile,
  ConstraintResult,
  ContentStrategy,
  EngineId,
  JsonValue,
  PatternIntelligenceResult,
  ExperienceStrategy,
  WebsiteSpec,
} from "../sdk";
import type { GraphEdge, GraphNode } from "../graph";
import type { RepositoryRecord } from "../repository";
import type { ReasoningCandidate, ReasoningResult } from "../reasoning";
import { DECISION_ENGINE_VERSION_STRING } from "./version";

/**
 * Normalized confidence bucket for a deterministic Decision Plan.
 *
 * @example
 * const confidence: DecisionConfidence = "high";
 */
export type DecisionConfidence = "low" | "medium" | "high";

/**
 * Explainable Decision Engine selection note.
 *
 * @example
 * const summary = explanation.summary;
 */
export type DecisionExplanation = Readonly<{
  id: EngineId | string;
  summary: string;
  candidateIds: string[];
  reasons: string[];
  warnings: string[];
}>;

/**
 * Metrics for one deterministic decision run.
 *
 * @example
 * const count = metrics.selectedPatternCount;
 */
export type DecisionMetrics = Readonly<{
  reasoningCandidateCount: number;
  selectedPatternCount: number;
  selectedComponentFamilyCount: number;
  repositoryReferenceCount: number;
  graphReferenceCount: number;
  constraintReferenceCount: number;
  warningCount: number;
}>;

/**
 * One coherent Website Strategy selected by the Decision Engine.
 *
 * @example
 * const archetype = plan.selectedArchetype;
 */
export type DecisionPlan = Readonly<{
  id: EngineId | string;
  version: string;
  selectedBusinessFamily: string;
  selectedIndustry: string;
  selectedArchetype: string;
  selectedWebsiteGoal: string;
  selectedDesignLanguage: string;
  selectedCompositionStrategy: string;
  selectedPatternSet: string[];
  selectedComponentFamilies: string[];
  selectedAssetStrategy: string;
  selectedCTAStrategy: string;
  selectedSEOStrategy: string;
  selectedAccessibilityStrategy: string;
  selectedResponsiveStrategy: string;
  selectedQualityGates: string[];
  confidence: number;
  explanations: DecisionExplanation[];
  repositoryReferencesUsed: string[];
  constraintReferencesUsed: string[];
  graphReferencesUsed: string[];
  warnings: string[];
}>;

/**
 * Input accepted by the deterministic Decision Engine.
 *
 * @example
 * const input: DecisionInput = { reasoningResult };
 */
export type DecisionInput = Readonly<{
  reasoningResult?: ReasoningResult;
  businessIntelligence?: BusinessIntelligenceProfile;
  brandIntelligence?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternIntelligence?: PatternIntelligenceResult;
  websiteSpec?: WebsiteSpec;
  constraintResult?: ConstraintResult;
  repositoryRecords?: RepositoryRecord[];
  graphNodes?: GraphNode[];
  graphEdges?: GraphEdge[];
  minimumConfidence?: number;
}>;

/**
 * Result returned by deterministic Decision Engine execution.
 *
 * @example
 * const plan = result.plan;
 */
export type DecisionResult = Readonly<{
  version: string;
  plan: DecisionPlan;
  metrics: DecisionMetrics;
  confidence: DecisionConfidence;
  warnings: string[];
}>;

/**
 * Selection categories used to build a coherent Decision Plan.
 *
 * @example
 * const category = DECISION_REQUIRED_CATEGORIES.archetype;
 */
export const DECISION_REQUIRED_CATEGORIES = Object.freeze({
  businessFamily: "Business Families",
  industry: "Industries",
  archetype: "Website Archetypes",
  designLanguage: "Design Languages",
  compositionStrategy: "Composition Strategies",
  assetStrategy: "Asset Strategies",
  ctaStrategy: "CTA Strategies",
  seoStrategy: "SEO Strategies",
  componentFamilies: "Component Families",
  patterns: "Patterns",
} as const);

/**
 * Creates a deterministic decision explanation.
 *
 * @example
 * const explanation = createDecisionExplanation("selected", [candidate]);
 */
export function createDecisionExplanation(summary: string, candidates: readonly ReasoningCandidate[], warnings: string[] = []): DecisionExplanation {
  return Object.freeze({
    id: `decision-explanation.${summary.toLowerCase().replaceAll(" ", "_")}`,
    summary,
    candidateIds: candidates.map((candidate) => String(candidate.id)),
    reasons: candidates.flatMap((candidate) => [
      `${candidate.label} scored ${candidate.score.overallScore.toFixed(2)} in ${candidate.category}.`,
      candidate.explanation.summary,
    ]),
    warnings,
  });
}

/**
 * Decision result version used by all Phase 18 outputs.
 *
 * @example
 * const version = DECISION_RESULT_VERSION;
 */
export const DECISION_RESULT_VERSION = DECISION_ENGINE_VERSION_STRING;
