import type { EngineWarning, JsonValue } from "../sdk";
import { SHADOW_COMPARISON_VERSION_STRING } from "./version";

export type ShadowWarning = EngineWarning;
export type ShadowSide = "v9" | "v10";
export type ShadowComparisonWinner = ShadowSide | "tie" | "incomplete";
export type ShadowRolloutReadiness = "not_ready" | "shadow_only" | "manual_review" | "ready_for_internal_preview";

/**
 * Normalized ai-v9 artifact summary accepted for shadow comparison.
 *
 * @example
 * const artifact: V9ShadowArtifact = { id: "v9.provided", provided: true, source: "provided", summary: "v9 metadata", missingSignals: [] };
 */
export type V9ShadowArtifact = Readonly<{
  id: string;
  provided: boolean;
  source: "provided" | "missing";
  summary: string;
  qualityScore?: number;
  editabilityScore?: number;
  rendererParityScore?: number;
  diversityScore?: number;
  performanceRisk?: number;
  safetyRisk?: number;
  repairabilityScore?: number;
  nativeBuilderCompatible?: boolean;
  nodeCount?: number;
  warningCount?: number;
  issueCount?: number;
  missingSignals: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Normalized Website Engine v10 artifact summary accepted for shadow comparison.
 *
 * @example
 * const artifact: V10ShadowArtifact = { id: "v10.provided", provided: true, source: "orchestrator", summary: "v10 metadata", missingSignals: [] };
 */
export type V10ShadowArtifact = Readonly<{
  id: string;
  provided: boolean;
  source: "orchestrator" | "provided" | "missing";
  summary: string;
  qualityScore?: number;
  editabilityScore?: number;
  rendererParityScore?: number;
  diversityScore?: number;
  performanceRisk?: number;
  safetyRisk?: number;
  repairabilityScore?: number;
  nativeBuilderCompatible?: boolean;
  completedStageCount?: number;
  blockedStageCount?: number;
  warningCount?: number;
  issueCount?: number;
  missingSignals: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Numeric or boolean metric used by comparison categories.
 *
 * @example
 * const metric: ShadowComparisonMetric = { label: "Quality", complete: true, higherIsBetter: true, v9Value: 70, v10Value: 82 };
 */
export type ShadowComparisonMetric = Readonly<{
  label: string;
  complete: boolean;
  higherIsBetter: boolean;
  v9Value?: number | boolean;
  v10Value?: number | boolean;
  missingSignals: string[];
}>;

export type ShadowCategoryComparison = Readonly<{
  category: "quality" | "editability" | "renderer-parity" | "similarity-diversity" | "performance-risk" | "safety-risk" | "repairability" | "native-builder-compatibility";
  metric: ShadowComparisonMetric;
  winner: ShadowComparisonWinner;
  reasons: string[];
}>;

export type ShadowQualityComparison = ShadowCategoryComparison & Readonly<{ category: "quality" }>;
export type ShadowEditabilityComparison = ShadowCategoryComparison & Readonly<{ category: "editability" }>;
export type ShadowParityComparison = ShadowCategoryComparison & Readonly<{ category: "renderer-parity" }>;
export type ShadowSimilarityComparison = ShadowCategoryComparison & Readonly<{ category: "similarity-diversity" }>;
export type ShadowPerformanceComparison = ShadowCategoryComparison & Readonly<{ category: "performance-risk" }>;
export type ShadowRiskComparison = ShadowCategoryComparison & Readonly<{ category: "safety-risk" }>;

/**
 * Final shadow comparison winner recommendation.
 *
 * @example
 * const winner: ShadowWinner = { winner: "incomplete", rolloutReadiness: "not_ready", recommendation: "Collect both artifacts.", reasons: [] };
 */
export type ShadowWinner = Readonly<{
  winner: ShadowComparisonWinner;
  rolloutReadiness: ShadowRolloutReadiness;
  recommendation: string;
  reasons: string[];
}>;

export type ShadowMetrics = Readonly<{
  comparisonCount: number;
  completeComparisonCount: number;
  incompleteComparisonCount: number;
  v9SignalCount: number;
  v10SignalCount: number;
  warningCount: number;
  metadataOnly: true;
  aiV9Executed: false;
  aiV10Generated: false;
  builderMutations: false;
  mapperExecuted: false;
  liveLlmCalls: false;
  networkCalls: false;
}>;

/**
 * Complete metadata-only ai-v9 shadow comparison result.
 *
 * @example
 * const result: ShadowComparisonResult = comparison.data;
 */
export type ShadowComparisonResult = Readonly<{
  id: string;
  version: typeof SHADOW_COMPARISON_VERSION_STRING;
  prompt?: string;
  v9Artifact: V9ShadowArtifact;
  v10Artifact: V10ShadowArtifact;
  qualityComparison: ShadowQualityComparison;
  editabilityComparison: ShadowEditabilityComparison;
  rendererParityComparison: ShadowParityComparison;
  similarityComparison: ShadowSimilarityComparison;
  performanceComparison: ShadowPerformanceComparison;
  riskComparison: ShadowRiskComparison;
  nativeBuilderCompatibilityComparison: ShadowCategoryComparison;
  repairabilityComparison: ShadowCategoryComparison;
  winnerRecommendation: ShadowWinner;
  rolloutReadiness: ShadowRolloutReadiness;
  incompleteReasons: string[];
  warnings: ShadowWarning[];
  metrics: ShadowMetrics;
  trace: string[];
  metadata: Record<string, JsonValue>;
  aiV9Executed: false;
  aiV10Generated: false;
  liveLlmCalls: false;
  dbCalls: false;
  networkCalls: false;
  mcpCalls: false;
  providerCalls: false;
  mapperExecuted: false;
  builderStoreWrites: false;
  builderNodesInserted: false;
  productionWiring: false;
}>;
