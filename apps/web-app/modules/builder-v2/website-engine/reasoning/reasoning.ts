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
import type { RepositoryRecord } from "../repository";
import type { GraphEdge, GraphNode } from "../graph";
import { REASONING_ENGINE_VERSION_STRING } from "./version";

/**
 * Candidate category emitted by deterministic reasoning.
 *
 * @example
 * const category: ReasoningCandidateCategory = "Website Archetypes";
 */
export type ReasoningCandidateCategory =
  | "Business Families"
  | "Industries"
  | "Subindustries"
  | "Website Archetypes"
  | "Patterns"
  | "Component Families"
  | "Design Languages"
  | "Composition Strategies"
  | "Asset Strategies"
  | "CTA Strategies"
  | "SEO Strategies"
  | "Repair Strategies";

/**
 * Normalized confidence bucket for reasoning output.
 *
 * @example
 * const confidence: ReasoningConfidence = "medium";
 */
export type ReasoningConfidence = "low" | "medium" | "high";

/**
 * Candidate score broken into deterministic scoring dimensions.
 *
 * @example
 * const score = candidate.score.overallScore;
 */
export type CandidateScore = Readonly<{
  compatibilityScore: number;
  constraintScore: number;
  repositoryScore: number;
  graphScore: number;
  confidence: number;
  overallScore: number;
}>;

/**
 * Explainable reason for a candidate score.
 *
 * @example
 * const reason = explanation.reasons[0];
 */
export type CandidateExplanation = Readonly<{
  candidateId: string;
  summary: string;
  reasons: string[];
  evidence: string[];
  risks: string[];
}>;

/**
 * One ranked candidate produced by the Reasoning Engine.
 *
 * @example
 * const id = candidate.id;
 */
export type ReasoningCandidate = Readonly<{
  id: EngineId | string;
  category: ReasoningCandidateCategory;
  label: string;
  source: "repository" | "graph" | "intelligence" | "constraint";
  repositoryRecordId?: string;
  graphNodeId?: string;
  constraintRuleIds: string[];
  compatibleIndustries: string[];
  compatibleArchetypes: string[];
  tags: string[];
  score: CandidateScore;
  explanation: CandidateExplanation;
  metadata: Record<string, JsonValue>;
}>;

/**
 * Unranked or ranked group of candidates for one category.
 *
 * @example
 * const candidates = set.candidates;
 */
export type CandidateSet = Readonly<{
  category: ReasoningCandidateCategory;
  candidates: ReasoningCandidate[];
}>;

/**
 * Metrics for one deterministic reasoning run.
 *
 * @example
 * const count = metrics.candidateCount;
 */
export type ReasoningMetrics = Readonly<{
  candidateCount: number;
  rankedCandidateCount: number;
  categoryCount: number;
  repositoryRecordCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
  constraintRuleCount: number;
}>;

/**
 * Input accepted by deterministic reasoning.
 *
 * @example
 * const input: ReasoningInput = { businessIntelligence };
 */
export type ReasoningInput = Readonly<{
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
  maxCandidatesPerCategory?: number;
}>;

/**
 * Result returned by deterministic reasoning.
 *
 * @example
 * const top = result.rankedCandidates[0];
 */
export type ReasoningResult = Readonly<{
  version: string;
  candidateSets: CandidateSet[];
  rankedCandidates: ReasoningCandidate[];
  metrics: ReasoningMetrics;
  confidence: ReasoningConfidence;
  notes: string[];
}>;

/**
 * Creates an empty normalized candidate score.
 *
 * @example
 * const score = createEmptyCandidateScore();
 */
export function createEmptyCandidateScore(): CandidateScore {
  return Object.freeze({
    compatibilityScore: 0,
    constraintScore: 0,
    repositoryScore: 0,
    graphScore: 0,
    confidence: 0,
    overallScore: 0,
  });
}

/**
 * Creates an unscored candidate for later deterministic scoring.
 *
 * @example
 * const candidate = createReasoningCandidate({ id: "candidate", category: "Patterns", label: "Trust" });
 */
export function createReasoningCandidate(input: Omit<ReasoningCandidate, "score" | "explanation"> & {
  score?: CandidateScore;
  explanation?: CandidateExplanation;
}): ReasoningCandidate {
  return Object.freeze({
    ...input,
    score: input.score ?? createEmptyCandidateScore(),
    explanation: input.explanation ?? {
      candidateId: String(input.id),
      summary: "Candidate has not been scored yet.",
      reasons: [],
      evidence: [],
      risks: [],
    },
  });
}

/**
 * Reasoning result version used by all Phase 17 outputs.
 *
 * @example
 * const version = REASONING_RESULT_VERSION;
 */
export const REASONING_RESULT_VERSION = REASONING_ENGINE_VERSION_STRING;
