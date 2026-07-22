import { createEngineResult, createEngineWarning, type EngineResult, type EngineWarning } from "../sdk";
import { runAccessibilityCritic } from "./accessibilityCritic";
import { runAssetCritic } from "./assetCritic";
import { runCompositionCritic } from "./compositionCritic";
import { runContentTruthCritic } from "./contentTruthCritic";
import { runConversionCritic } from "./conversionCritic";
import type { CriticInput } from "./criticInput";
import type { CriticCategoryResult, CriticConfidence, CriticMetrics, CriticResult } from "./criticResult";
import { runCreativeLibraryCritic } from "./creativeLibraryCritic";
import { normalizeConfidence, scoreCriticResult } from "./criticScoring";
import { criticValidationWarnings, validateCriticInput, validateCriticResult } from "./criticValidation";
import { runDesignDnaCritic } from "./designDnaCritic";
import { runEditabilityCritic } from "./editabilityCritic";
import { runIndustryFitCritic } from "./industryFitCritic";
import { runMobileCritic } from "./mobileCritic";
import { runMotionCritic } from "./motionCritic";
import { runPerformanceCritic } from "./performanceCritic";
import { runQualityGates } from "./qualityGates";
import { runRendererParityCritic } from "./rendererParityCritic";
import { runSeoCritic } from "./seoCritic";
import { runSpacingCritic } from "./spacingCritic";
import { runTypographyCritic } from "./typographyCritic";
import { runVisualHierarchyCritic } from "./visualHierarchyCritic";
import { CRITIC_ENGINE_VERSION_STRING } from "./version";
import { buildWebsiteEvaluation } from "./websiteEvaluation";

function collectCategoryResults(input: CriticInput): CriticCategoryResult[] {
  return [
    runVisualHierarchyCritic(input),
    runTypographyCritic(input),
    runSpacingCritic(input),
    runCompositionCritic(input),
    runDesignDnaCritic(input),
    runCreativeLibraryCritic(input),
    runContentTruthCritic(input),
    runConversionCritic(input),
    runAccessibilityCritic(input),
    runSeoCritic(input),
    runPerformanceCritic(input),
    runMobileCritic(input),
    runEditabilityCritic(input),
    runRendererParityCritic(input),
    runIndustryFitCritic(input),
    runAssetCritic(input),
    runMotionCritic(input),
  ];
}

function collectWarnings(categoryResults: readonly CriticCategoryResult[], validationIssues: readonly string[]): EngineWarning[] {
  const issueWarnings = categoryResults.flatMap((result) => result.issues.filter((issue) => issue.severity !== "info").map((issue) => createEngineWarning(
    issue.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
    issue.message,
    "critic",
    issue.severity === "blocker" ? "major" : issue.severity,
    { category: issue.category, repairHint: issue.repairHint, targetId: issue.targetId ?? null }
  )));
  const failureWarnings = categoryResults.flatMap((result) => result.hardFailures.map((failure) => createEngineWarning(
    failure.code,
    failure.message,
    "critic",
    "major",
    { category: failure.category, repairHint: failure.repairHint, blocksPublish: true, targetId: failure.id }
  )));
  return [...issueWarnings, ...failureWarnings, ...criticValidationWarnings(validationIssues)];
}

function collectConfidence(input: CriticInput, categoryResults: readonly CriticCategoryResult[]): CriticConfidence {
  const signals = [
    Boolean(input.compiledPlan),
    Boolean(input.builderBlueprintResult || input.builderBlueprint),
    Boolean(input.mappingPlan),
    Boolean(input.simulationResult),
    Boolean(input.rendererParityResult),
    Boolean(input.creativeLibraryResult),
    Boolean(input.designDNA),
    Boolean(input.mediaStrategy),
    Boolean(input.motionStrategy),
  ];
  const metadataCompleteness = signals.filter(Boolean).length / signals.length;
  const averageCategoryScore = categoryResults.reduce((sum, result) => sum + result.score.score, 0) / Math.max(1, categoryResults.length);
  return Object.freeze({
    score: normalizeConfidence(metadataCompleteness * 0.65 + (averageCategoryScore / 100) * 0.35),
    reasons: [
      `Metadata signals present: ${signals.filter(Boolean).length}/${signals.length}.`,
      `Average category score: ${Math.round(averageCategoryScore)}.`,
    ],
  });
}

function collectMetrics(categoryResults: readonly CriticCategoryResult[], warnings: readonly EngineWarning[], qualityGateCount: number): CriticMetrics {
  const issues = categoryResults.flatMap((result) => result.issues);
  const hardFailures = categoryResults.flatMap((result) => result.hardFailures);
  const recommendations = categoryResults.flatMap((result) => result.recommendations);
  return Object.freeze({
    categoryCount: categoryResults.length,
    issueCount: issues.length,
    warningCount: warnings.length,
    recommendationCount: recommendations.length,
    hardFailureCount: hardFailures.length,
    qualityGateCount,
    repairHintCount: new Set([...issues.map((issue) => issue.repairHint), ...hardFailures.map((failure) => failure.repairHint), ...recommendations.map((recommendation) => recommendation.repairHint)]).size,
    metadataOnly: true as const,
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  });
}

/**
 * Runs the deterministic metadata-only Website Critic.
 *
 * @example
 * const result = runCriticEngine({ simulationResult, rendererParityResult });
 */
export function runCriticEngine(input: CriticInput = {}): EngineResult<CriticResult> {
  const inputValidation = validateCriticInput(input);
  const categoryResults = collectCategoryResults(input);
  const hardFailures = categoryResults.flatMap((result) => result.hardFailures);
  const issues = categoryResults.flatMap((result) => result.issues);
  const recommendations = categoryResults.flatMap((result) => result.recommendations);
  const overallScore = scoreCriticResult(categoryResults, hardFailures);
  const qualityGateResults = runQualityGates(overallScore, hardFailures);
  const previewReady = overallScore >= 85 && hardFailures.length === 0;
  const publishRecommended = overallScore >= 90 && hardFailures.length === 0;
  const preliminaryWarnings = collectWarnings(categoryResults, inputValidation.issues);
  const confidence = collectConfidence(input, categoryResults);
  const repairHints = [...new Set([...issues.map((issue) => issue.repairHint), ...hardFailures.map((failure) => failure.repairHint), ...recommendations.map((recommendation) => recommendation.repairHint)])];
  const baseResult = {
    id: `critic.${input.compiledPlan?.id ?? input.builderBlueprintResult?.blueprint.id ?? input.mappingPlan?.id ?? "metadata"}`,
    version: CRITIC_ENGINE_VERSION_STRING,
    overallScore,
    passed: previewReady,
    previewReady,
    publishRecommended,
    publishRecommendation: publishRecommended ? "publish_recommended" as const : previewReady ? "preview_ready" as const : hardFailures.length > 0 ? "blocked" as const : "repair_required" as const,
    categoryScores: categoryResults.map((result) => result.score),
    hardFailures,
    issues,
    warnings: preliminaryWarnings,
    recommendations,
    repairHints,
    qualityGateResults,
    confidence,
    metrics: collectMetrics(categoryResults, preliminaryWarnings, qualityGateResults.length),
    evaluation: undefined,
    trace: [
      "critic.metadata-only",
      "no-screenshot-capture",
      "no-rendering",
      "no-builder-store-write",
      "no-mapper-execution",
      "no-network-db-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: {
      inputValidationIssues: inputValidation.issues,
      upstream: {
        hasSimulation: Boolean(input.simulationResult),
        hasRendererParity: Boolean(input.rendererParityResult),
        hasCreativeLibrary: Boolean(input.creativeLibraryResult),
        hasDesignDNA: Boolean(input.designDNA),
      },
    },
    rendered: false as const,
    screenshotCaptured: false as const,
    sideEffects: false as const,
  };

  const resultWithoutEvaluation = baseResult as Omit<CriticResult, "evaluation"> & { evaluation: undefined };
  const withEvaluation = Object.freeze({ ...resultWithoutEvaluation, evaluation: buildWebsiteEvaluation(resultWithoutEvaluation) }) as CriticResult;
  const resultValidation = validateCriticResult(withEvaluation);
  const warnings = resultValidation.valid ? preliminaryWarnings : [...preliminaryWarnings, ...criticValidationWarnings(resultValidation.issues)];
  const finalResult = Object.freeze({
    ...withEvaluation,
    warnings,
    metrics: collectMetrics(categoryResults, warnings, qualityGateResults.length),
    metadata: { ...withEvaluation.metadata, resultValidationIssues: resultValidation.issues },
  });

  return createEngineResult({
    module: "critic",
    stage: "metadata-evaluation",
    data: finalResult,
    status: hardFailures.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "ok",
    warnings,
    metadata: {
      phase: "PHASE_35_CRITIC_ENGINE",
      metadataOnly: true,
      categoryCount: categoryResults.length,
      hardFailureCount: hardFailures.length,
    },
    confidence: confidence.score,
  });
}
