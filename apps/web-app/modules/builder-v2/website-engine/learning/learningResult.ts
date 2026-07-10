import type { BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { CriticResult } from "../critic";
import type { CreativeLibraryResult } from "../creative-library";
import type { DesignDNA } from "../creative-library/dna";
import type { RecipeAssemblyResult } from "../creative-library/fragments";
import type { EvolutionResult } from "../evolution";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { RepairResult } from "../repair";
import type { RendererParityResult } from "../renderer-parity";
import type { EngineWarning, JsonValue, WebsiteDNA, WebsiteSpec } from "../sdk";
import type { SelfPlayResult } from "../self-play";
import type { SimilarityResult } from "../similarity";
import type { SimulationResult } from "../simulation";
import { LEARNING_ENGINE_VERSION_STRING } from "./version";

export type LearningWarning = EngineWarning;
export type LearningSignalKind = "pattern" | "recipe" | "fragment" | "design-dna" | "critic" | "repair" | "similarity" | "self-play" | "ranking";

/**
 * Generic normalized ranking signal.
 *
 * @example
 * const signal: RankingSignal = { id: "signal", kind: "ranking", targetId: "candidate", score: 0.8, weight: 1, reason: "High score" };
 */
export type RankingSignal = Readonly<{ id: string; kind: LearningSignalKind; targetId: string; score: number; weight: number; reason: string; metadata: Record<string, JsonValue> }>;
export type PatternLearningSignal = RankingSignal & Readonly<{ kind: "pattern" }>;
export type RecipeLearningSignal = RankingSignal & Readonly<{ kind: "recipe" }>;
export type FragmentLearningSignal = RankingSignal & Readonly<{ kind: "fragment" }>;
export type DesignDnaLearningSignal = RankingSignal & Readonly<{ kind: "design-dna" }>;
export type CriticLearningSignal = RankingSignal & Readonly<{ kind: "critic" }>;
export type RepairLearningSignal = RankingSignal & Readonly<{ kind: "repair" }>;
export type SimilarityLearningSignal = RankingSignal & Readonly<{ kind: "similarity" }>;
export type SelfPlayLearningSignal = RankingSignal & Readonly<{ kind: "self-play" }>;

/**
 * Local metadata-only learning record. It is not persisted by Phase 37.
 *
 * @example
 * const record: LearningRecord = { id: "record", source: "critic", signalIds: [], createdAt: new Date().toISOString(), persisted: false, metadata: {} };
 */
export type LearningRecord = Readonly<{ id: string; source: LearningSignalKind | "history"; signalIds: string[]; createdAt: string; persisted: false; metadata: Record<string, JsonValue> }>;

/**
 * Generation history metadata derived from current inputs.
 *
 * @example
 * const history = result.generationHistory;
 */
export type GenerationHistory = Readonly<{ id: string; specId?: string; compiledPlanId?: string; candidateId?: string; traceIds: string[]; userSignalsAvailable: boolean; publishSignalsAvailable: boolean; persisted: false; metadata: Record<string, JsonValue> }>;

/**
 * Aggregated signal summary for future deterministic ranking.
 *
 * @example
 * const summary = result.aggregationSummary;
 */
export type LearningAggregation = Readonly<{ totalSignals: number; weightedScore: number; strongestSignals: string[]; weakestSignals: string[]; missingTelemetry: string[]; metadata: Record<string, JsonValue> }>;

export type LearningMetrics = Readonly<{ recordCount: number; signalCount: number; warningCount: number; missingTelemetryCount: number; metadataOnly: true; persisted: false; builderMutations: false; mapperExecuted: false }>;
export type LearningConfidence = Readonly<{ score: number; reasons: string[] }>;

/**
 * Inputs accepted by the metadata-only Learning Engine.
 *
 * @example
 * const input: LearningInput = { criticResult, selfPlayResult };
 */
export type LearningInput = Readonly<{
  creativeLibraryResult?: CreativeLibraryResult;
  designDNA?: DesignDNA;
  recipeAssemblyResults?: readonly RecipeAssemblyResult[];
  evolutionResult?: EvolutionResult;
  criticResult?: CriticResult;
  similarityResult?: SimilarityResult;
  repairResult?: RepairResult;
  selfPlayResult?: SelfPlayResult;
  simulationResult?: SimulationResult;
  rendererParityResult?: RendererParityResult;
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  mappingPlan?: NativeBuilderMappingPlan;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  userEditSignals?: readonly JsonValue[];
  publishSignals?: readonly JsonValue[];
  featureFlags?: Readonly<Record<string, boolean>>;
}>;

/**
 * Complete metadata-only Learning Engine result.
 *
 * @example
 * const signals = result.rankingSignals;
 */
export type LearningResult = Readonly<{
  id: string;
  version: typeof LEARNING_ENGINE_VERSION_STRING;
  learningRecords: LearningRecord[];
  generationHistory: GenerationHistory;
  rankingSignals: RankingSignal[];
  patternSignals: PatternLearningSignal[];
  recipeSignals: RecipeLearningSignal[];
  fragmentSignals: FragmentLearningSignal[];
  designDnaSignals: DesignDnaLearningSignal[];
  criticSignals: CriticLearningSignal[];
  repairSignals: RepairLearningSignal[];
  similaritySignals: SimilarityLearningSignal[];
  selfPlaySignals: SelfPlayLearningSignal[];
  aggregationSummary: LearningAggregation;
  warnings: LearningWarning[];
  metrics: LearningMetrics;
  confidence: LearningConfidence;
  trace: string[];
  metadata: Record<string, JsonValue>;
  persisted: false;
  builderMutations: false;
  mapperExecuted: false;
}>;

export function normalizeLearningScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

export function createRankingSignal(input: Omit<RankingSignal, "score"> & { score: number }): RankingSignal {
  return Object.freeze({ ...input, score: normalizeLearningScore(input.score) });
}
