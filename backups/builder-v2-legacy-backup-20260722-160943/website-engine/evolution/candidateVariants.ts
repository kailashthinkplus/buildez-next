import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { CriticResult, CriticWarning } from "../critic";
import type { CreativeLibraryResult } from "../creative-library";
import type { DesignDNA } from "../creative-library/dna";
import type { RecipeAssemblyResult } from "../creative-library/fragments";
import type { DesignResult } from "../design";
import type { BrandIntelligenceProfile, BusinessIntelligenceProfile, ContentStrategy, EngineWarning, ExperienceStrategy, JsonValue, PatternIntelligenceResult, WebsiteSpec } from "../sdk";
import type { SimilarityResult, WebsiteSimilarityProfile } from "../similarity";
import { CANDIDATE_EVOLUTION_VERSION_STRING } from "./version";

export type EvolutionWarning = EngineWarning | CriticWarning;
export type CandidateMutationKind =
  | "hero-recipe"
  | "recipe-family"
  | "fragment-selection"
  | "design-dna-weighting"
  | "typography-rhythm"
  | "spacing-rhythm"
  | "layout-rhythm"
  | "motion-rhythm"
  | "cta-cadence"
  | "composition-ordering"
  | "visual-density"
  | "media-strategy"
  | "grid-philosophy"
  | "asymmetry-level";

/**
 * Input accepted by deterministic Candidate Evolution.
 *
 * @example
 * const input: EvolutionInput = { creativeLibraryResult, criticResult, similarityResult };
 */
export type EvolutionInput = Readonly<{
  businessProfile?: BusinessIntelligenceProfile;
  brandProfile?: BrandIntelligenceProfile;
  contentStrategy?: ContentStrategy;
  experienceStrategy?: ExperienceStrategy;
  patternResult?: PatternIntelligenceResult;
  designResult?: DesignResult;
  creativeLibraryResult?: CreativeLibraryResult;
  designDNA?: DesignDNA;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  websiteSpec?: WebsiteSpec;
  compiledPlan?: CompiledWebsitePlan;
  criticResult?: CriticResult;
  similarityResult?: SimilarityResult;
  featureFlags?: Readonly<Record<string, boolean>>;
}>;

/**
 * Metadata-only mutation applied to a candidate profile.
 *
 * @example
 * const mutation: CandidateMutation = { id: "mut.1", kind: "layout-rhythm", description: "Switch layout rhythm.", before: ["direct"], after: ["editorial"] };
 */
export type CandidateMutation = Readonly<{
  id: string;
  kind: CandidateMutationKind;
  description: string;
  before: string[];
  after: string[];
}>;

/**
 * Deterministic variant recipe for creating a candidate.
 *
 * @example
 * const variant: CandidateVariant = { id: "variant.a", label: "Editorial", mutationKinds: ["layout-rhythm"], priority: 1 };
 */
export type CandidateVariant = Readonly<{
  id: string;
  label: string;
  mutationKinds: CandidateMutationKind[];
  priority: number;
}>;

/**
 * Comparable candidate profile.
 *
 * @example
 * const profile = candidate.profile;
 */
export type CandidateProfile = Readonly<{
  id: string;
  label: string;
  similarityProfile: WebsiteSimilarityProfile;
  variant: CandidateVariant;
  mutations: CandidateMutation[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Metadata-only website candidate.
 *
 * @example
 * const candidate: WebsiteCandidate = candidates[0];
 */
export type WebsiteCandidate = Readonly<{
  id: string;
  version: typeof CANDIDATE_EVOLUTION_VERSION_STRING;
  profile: CandidateProfile;
  sourcePlanId?: string;
  generatedBuilderNodes: false;
  rendered: false;
  persisted: false;
}>;

/**
 * Optional candidate history accepted by future callers.
 *
 * @example
 * const history: CandidateHistory = { previousWinnerIds: [], previousProfiles: [] };
 */
export type CandidateHistory = Readonly<{
  previousWinnerIds: string[];
  previousProfiles: WebsiteSimilarityProfile[];
}>;

/**
 * Candidate-to-candidate comparison.
 *
 * @example
 * const comparison: CandidateComparison = comparisons[0];
 */
export type CandidateComparison = Readonly<{
  leftCandidateId: string;
  rightCandidateId: string;
  similarity: number;
  sharedDimensions: string[];
}>;

/**
 * Normalized score for one candidate.
 *
 * @example
 * const score = ranking[0].score;
 */
export type CandidateScore = Readonly<{
  candidateId: string;
  overallScore: number;
  criticScore: number;
  similarityScore: number;
  diversityScore: number;
  industryFit: number;
  accessibility: number;
  performance: number;
  editability: number;
  contentTruth: number;
  motionSafety: number;
  designDnaConsistency: number;
  creativeDiversity: number;
  reasons: string[];
}>;

/**
 * Ranked candidate entry.
 *
 * @example
 * const rank = ranking[0].rank;
 */
export type CandidateRanking = Readonly<{
  rank: number;
  candidate: WebsiteCandidate;
  score: CandidateScore;
}>;

/**
 * Selected winner.
 *
 * @example
 * const winner = result.winner;
 */
export type CandidateWinner = Readonly<{
  candidate: WebsiteCandidate;
  score: CandidateScore;
  selectionReason: string;
}>;

/**
 * Evolution confidence.
 *
 * @example
 * const confidence = result.confidence.score;
 */
export type EvolutionConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Evolution metrics.
 *
 * @example
 * const count = result.metrics.candidateCount;
 */
export type EvolutionMetrics = Readonly<{
  candidateCount: number;
  mutationCount: number;
  comparisonCount: number;
  warningCount: number;
  runnerUpCount: number;
  metadataOnly: true;
  rendered: false;
  persisted: false;
  builderNodesCreated: false;
  mapperExecuted: false;
}>;

/**
 * Complete metadata-only Candidate Evolution result.
 *
 * @example
 * const winner = result.winner.candidate.id;
 */
export type EvolutionResult = Readonly<{
  id: string;
  version: typeof CANDIDATE_EVOLUTION_VERSION_STRING;
  winner: CandidateWinner;
  runnerUps: CandidateRanking[];
  candidates: WebsiteCandidate[];
  candidateScores: CandidateScore[];
  criticScores: Record<string, number>;
  similarityScores: Record<string, number>;
  ranking: CandidateRanking[];
  comparisons: CandidateComparison[];
  selectionReason: string;
  repairPriority: string[];
  metrics: EvolutionMetrics;
  warnings: EvolutionWarning[];
  confidence: EvolutionConfidence;
  trace: string[];
  metadata: Record<string, JsonValue>;
  rendered: false;
  persisted: false;
  builderNodesCreated: false;
  mapperExecuted: false;
}>;

/**
 * Builds the deterministic candidate variant catalog.
 *
 * @example
 * const variants = buildCandidateVariants();
 */
export function buildCandidateVariants(): CandidateVariant[] {
  return Object.freeze([
    Object.freeze({ id: "a.trust-editorial", label: "Trust Editorial", mutationKinds: ["hero-recipe", "layout-rhythm", "typography-rhythm", "cta-cadence"], priority: 1 }),
    Object.freeze({ id: "b.conversion-direct", label: "Conversion Direct", mutationKinds: ["recipe-family", "cta-cadence", "spacing-rhythm", "composition-ordering"], priority: 2 }),
    Object.freeze({ id: "c.visual-depth", label: "Visual Depth", mutationKinds: ["fragment-selection", "design-dna-weighting", "visual-density", "media-strategy"], priority: 3 }),
    Object.freeze({ id: "d.motion-clarity", label: "Motion Clarity", mutationKinds: ["motion-rhythm", "grid-philosophy", "asymmetry-level", "layout-rhythm"], priority: 4 }),
    Object.freeze({ id: "e.premium-structure", label: "Premium Structure", mutationKinds: ["hero-recipe", "fragment-selection", "typography-rhythm", "visual-density", "composition-ordering"], priority: 5 }),
  ]);
}
