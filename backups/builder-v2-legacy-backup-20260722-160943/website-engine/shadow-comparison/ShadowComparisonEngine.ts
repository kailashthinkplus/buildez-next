import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { adaptV10Artifact } from "./v10ArtifactAdapter";
import { adaptV9Artifact } from "./v9ArtifactAdapter";
import { compareEditability } from "./editabilityComparison";
import { comparePerformanceRisk } from "./performanceComparison";
import { compareRendererParity } from "./parityComparison";
import { compareQuality } from "./qualityComparison";
import { compareSafetyRisk, compareNativeBuilderCompatibility, compareRepairability, selectShadowWinner } from "./riskComparison";
import { compareSimilarity } from "./similarityComparison";
import type { ShadowComparisonInput } from "./shadowInput";
import type { ShadowCategoryComparison, ShadowComparisonResult, ShadowMetrics } from "./shadowResult";
import { validateShadowComparisonInput, validateShadowComparisonResult } from "./shadowValidation";
import { SHADOW_COMPARISON_VERSION_STRING } from "./version";

function countSignals(values: readonly unknown[]): number {
  return values.filter((value) => value !== undefined).length;
}

function metricsFor(result: Omit<ShadowComparisonResult, "metrics">): ShadowMetrics {
  const comparisons: ShadowCategoryComparison[] = [
    result.qualityComparison,
    result.editabilityComparison,
    result.rendererParityComparison,
    result.similarityComparison,
    result.performanceComparison,
    result.riskComparison,
    result.nativeBuilderCompatibilityComparison,
    result.repairabilityComparison,
  ];
  return Object.freeze({
    comparisonCount: comparisons.length,
    completeComparisonCount: comparisons.filter((comparison) => comparison.metric.complete).length,
    incompleteComparisonCount: comparisons.filter((comparison) => !comparison.metric.complete).length,
    v9SignalCount: countSignals([
      result.v9Artifact.qualityScore,
      result.v9Artifact.editabilityScore,
      result.v9Artifact.rendererParityScore,
      result.v9Artifact.diversityScore,
      result.v9Artifact.performanceRisk,
      result.v9Artifact.safetyRisk,
      result.v9Artifact.repairabilityScore,
      result.v9Artifact.nativeBuilderCompatible,
    ]),
    v10SignalCount: countSignals([
      result.v10Artifact.qualityScore,
      result.v10Artifact.editabilityScore,
      result.v10Artifact.rendererParityScore,
      result.v10Artifact.diversityScore,
      result.v10Artifact.performanceRisk,
      result.v10Artifact.safetyRisk,
      result.v10Artifact.repairabilityScore,
      result.v10Artifact.nativeBuilderCompatible,
    ]),
    warningCount: result.warnings.length,
    metadataOnly: true as const,
    aiV9Executed: false as const,
    aiV10Generated: false as const,
    builderMutations: false as const,
    mapperExecuted: false as const,
    liveLlmCalls: false as const,
    networkCalls: false as const,
  });
}

/**
 * Runs metadata-only ai-v9 shadow comparison.
 *
 * @example
 * const result = runShadowComparison({ aiV9Artifact: { qualityScore: 70 }, criticResult });
 */
export function runShadowComparison(input: ShadowComparisonInput = {}): EngineResult<ShadowComparisonResult> {
  const inputValidation = validateShadowComparisonInput(input);
  const v9Artifact = adaptV9Artifact(input);
  const v10Artifact = adaptV10Artifact(input);
  const qualityComparison = compareQuality(v9Artifact, v10Artifact);
  const editabilityComparison = compareEditability(v9Artifact, v10Artifact);
  const rendererParityComparison = compareRendererParity(v9Artifact, v10Artifact);
  const similarityComparison = compareSimilarity(v9Artifact, v10Artifact);
  const performanceComparison = comparePerformanceRisk(v9Artifact, v10Artifact);
  const riskComparison = compareSafetyRisk(v9Artifact, v10Artifact);
  const nativeBuilderCompatibilityComparison = compareNativeBuilderCompatibility(v9Artifact, v10Artifact);
  const repairabilityComparison = compareRepairability(v9Artifact, v10Artifact);
  const comparisons: ShadowCategoryComparison[] = [
    qualityComparison,
    editabilityComparison,
    rendererParityComparison,
    similarityComparison,
    performanceComparison,
    riskComparison,
    nativeBuilderCompatibilityComparison,
    repairabilityComparison,
  ];
  const winnerRecommendation = selectShadowWinner(comparisons);
  const incompleteReasons = [
    ...v9Artifact.missingSignals,
    ...v10Artifact.missingSignals,
    ...comparisons.flatMap((comparison) => comparison.metric.missingSignals),
  ].filter((reason, index, all) => all.indexOf(reason) === index);
  const baseWarnings = [
    ...inputValidation.issues.map((issue) => createEngineWarning("SHADOW_COMPARISON_INPUT_WARNING", issue, "shadow-comparison", "minor")),
    ...(incompleteReasons.length ? [createEngineWarning("SHADOW_COMPARISON_INCOMPLETE", "Shadow comparison is incomplete because required metadata signals are missing.", "shadow-comparison", "major", { missingSignalCount: incompleteReasons.length })] : []),
  ];
  const resultBase = {
    id: `shadow-comparison.${input.prompt ? input.prompt.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "").slice(0, 48) : "metadata"}`,
    version: SHADOW_COMPARISON_VERSION_STRING,
    prompt: input.prompt,
    v9Artifact,
    v10Artifact,
    qualityComparison,
    editabilityComparison,
    rendererParityComparison,
    similarityComparison,
    performanceComparison,
    riskComparison,
    nativeBuilderCompatibilityComparison,
    repairabilityComparison,
    winnerRecommendation,
    rolloutReadiness: winnerRecommendation.rolloutReadiness,
    incompleteReasons,
    warnings: baseWarnings,
    trace: [
      "shadow-comparison.metadata-only",
      "ai-v9-not-executed",
      "v10-not-generated",
      "no-live-llm-api-calls",
      "no-db-network-mcp-provider-calls",
      "no-builder-mutation",
      "no-mapper-execution",
      "no-screenshot-capture",
      "feature-flags-remain-false",
    ],
    metadata: {
      phase: "PHASE_40_AI_V9_SHADOW_COMPARISON",
      metadataOnly: true,
      v9Provided: v9Artifact.provided,
      v10Provided: v10Artifact.provided,
      ...(input.metadata ?? {}),
    },
    aiV9Executed: false as const,
    aiV10Generated: false as const,
    liveLlmCalls: false as const,
    dbCalls: false as const,
    networkCalls: false as const,
    mcpCalls: false as const,
    providerCalls: false as const,
    mapperExecuted: false as const,
    builderStoreWrites: false as const,
    builderNodesInserted: false as const,
    productionWiring: false as const,
  };
  const resultWithMetrics = Object.freeze({ ...resultBase, metrics: metricsFor(resultBase) });
  const resultValidation = validateShadowComparisonResult(resultWithMetrics);
  const warnings = resultValidation.valid
    ? baseWarnings
    : [...baseWarnings, ...resultValidation.issues.map((issue) => createEngineWarning("SHADOW_COMPARISON_RESULT_WARNING", issue, "shadow-comparison", "major"))];
  const finalResult = Object.freeze({ ...resultWithMetrics, warnings, metrics: metricsFor({ ...resultWithMetrics, warnings }) });

  return createEngineResult({
    module: "shadow-comparison",
    stage: "metadata-shadow-comparison",
    data: finalResult,
    status: warnings.length ? "warning" : "ok",
    warnings,
    metadata: { phase: "PHASE_40_AI_V9_SHADOW_COMPARISON", metadataOnly: true, aiV9Executed: false },
  });
}
