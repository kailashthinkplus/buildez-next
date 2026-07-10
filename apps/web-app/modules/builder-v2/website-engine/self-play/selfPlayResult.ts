import type { BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { CriticResult } from "../critic";
import type { DesignDNA } from "../creative-library/dna";
import type { RecipeAssemblyResult } from "../creative-library/fragments";
import type { CandidateWinner, EvolutionResult, WebsiteCandidate } from "../evolution";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { RepairPlan, RepairResult } from "../repair";
import type { EngineWarning, JsonValue, WebsiteDNA, WebsiteSpec } from "../sdk";
import type { SimilarityResult } from "../similarity";
import type { SimulationResult } from "../simulation";
import type { CreativeLibraryResult } from "../creative-library";
import { SELF_PLAY_VERSION_STRING } from "./version";

export type SelfPlayWarning = EngineWarning;

/**
 * Quality target for self-play optimization.
 *
 * @example
 * const target: QualityTarget = { score: 95, maxIterations: 3, allowedSimilarity: 0.7 };
 */
export type QualityTarget = Readonly<{ score: number; maxIterations: number; allowedSimilarity: number; minimumImprovement: number }>;

/**
 * Normalized optimization score.
 *
 * @example
 * const score = candidate.score.overallScore;
 */
export type OptimizationScore = Readonly<{
  overallScore: number;
  criticScore: number;
  diversityScore: number;
  repairImpact: number;
  riskPenalty: number;
  reasons: string[];
}>;

/**
 * Metadata-only optimization candidate.
 *
 * @example
 * const candidate = result.bestCandidate;
 */
export type OptimizationCandidate = Readonly<{
  id: string;
  sourceCandidate?: WebsiteCandidate;
  score: OptimizationScore;
  repairPlan?: RepairPlan;
  metadata: Record<string, JsonValue>;
  appliedToBuilder: false;
  rendered: false;
  codeGenerated: false;
}>;

/**
 * Metadata-only repair plan application simulation.
 *
 * @example
 * const application = applyRepairPlanMetadata(candidate, plan, 1);
 */
export type RepairPlanApplication = Readonly<{
  id: string;
  iteration: number;
  repairPlanId: string;
  actionIds: string[];
  expectedScoreDelta: number;
  unresolvedActions: string[];
  requiresMissingFactsOrAssets: boolean;
  metadataOnly: true;
  appliedToBuilder: false;
}>;

/**
 * Optimization iteration record.
 *
 * @example
 * const iteration = result.iterationHistory[0];
 */
export type OptimizationIteration = Readonly<{
  iteration: number;
  candidate: OptimizationCandidate;
  repairApplication?: RepairPlanApplication;
  criticScore: number;
  similarityScore: number;
  diversityScore: number;
  overallScore: number;
  improvement: number;
  notes: string[];
}>;

export type OptimizationStoppingReason =
  | "target-score-reached"
  | "max-iterations-reached"
  | "no-meaningful-improvement"
  | "hard-failure-not-repairable-metadata-only"
  | "repair-requires-missing-facts-or-assets"
  | "diversity-worsened-above-threshold";

/**
 * Trace summary for the optimization loop.
 *
 * @example
 * const trace = result.optimizationTrace;
 */
export type OptimizationTrace = Readonly<{ events: string[]; metadata: Record<string, JsonValue> }>;

export type SelfPlayMetrics = Readonly<{
  iterationCount: number;
  repairApplicationCount: number;
  warningCount: number;
  initialScore: number;
  finalScore: number;
  metadataOnly: true;
  builderMutations: false;
  mapperExecuted: false;
  rendered: false;
  codeGenerated: false;
}>;

export type SelfPlayConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Input accepted by Self-Play Optimization.
 *
 * @example
 * const input: SelfPlayInput = { evolutionResult, repairResult, targetScore: 95 };
 */
export type SelfPlayInput = Readonly<{
  evolutionResult?: EvolutionResult;
  winner?: CandidateWinner;
  criticResult?: CriticResult;
  similarityResult?: SimilarityResult;
  repairResult?: RepairResult;
  simulationResult?: SimulationResult;
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  designDNA?: DesignDNA;
  creativeLibraryResult?: CreativeLibraryResult;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  mappingPlan?: NativeBuilderMappingPlan;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  maxIterations?: number;
  targetScore?: number;
  featureFlags?: Readonly<Record<string, boolean>>;
}>;

/**
 * Complete Self-Play Optimization result.
 *
 * @example
 * const best = result.bestCandidate;
 */
export type SelfPlayResult = Readonly<{
  id: string;
  version: typeof SELF_PLAY_VERSION_STRING;
  bestCandidate: OptimizationCandidate;
  iterationHistory: OptimizationIteration[];
  appliedRepairPlanMetadata: RepairPlanApplication[];
  criticScoreProgression: number[];
  similarityScoreProgression: number[];
  diversityScoreProgression: number[];
  overallOptimizationScoreProgression: number[];
  stoppingReason: OptimizationStoppingReason;
  finalRecommendation: string;
  remainingRisks: string[];
  warnings: SelfPlayWarning[];
  metrics: SelfPlayMetrics;
  confidence: SelfPlayConfidence;
  optimizationTrace: OptimizationTrace;
  trace: string[];
  metadata: Record<string, JsonValue>;
  appliedToBuilder: false;
  mapperExecuted: false;
  rendered: false;
  codeGenerated: false;
}>;
