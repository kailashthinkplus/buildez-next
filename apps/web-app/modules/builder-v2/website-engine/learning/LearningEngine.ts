import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { extractCriticLearningSignals } from "./criticLearning";
import { extractDesignDnaLearningSignals } from "./designDnaLearning";
import { extractFragmentLearningSignals } from "./fragmentLearning";
import { buildGenerationHistory } from "./generationHistory";
import { aggregateLearningSignals } from "./learningAggregation";
import type { LearningConfidence, LearningInput, LearningMetrics, LearningResult } from "./learningResult";
import { buildLearningRecords } from "./learningRecord";
import { validateLearningInput, validateLearningResult } from "./learningValidation";
import { extractPatternLearningSignals } from "./patternLearning";
import { extractRankingSignals } from "./rankingSignals";
import { extractRecipeLearningSignals } from "./recipeLearning";
import { extractRepairLearningSignals } from "./repairLearning";
import { extractSelfPlayLearningSignals } from "./selfPlayLearning";
import { extractSimilarityLearningSignals } from "./similarityLearning";
import { LEARNING_ENGINE_VERSION_STRING } from "./version";

function missingTelemetry(input: LearningInput): string[] {
  return [
    ...(!input.userEditSignals?.length ? ["userEditSignals"] : []),
    ...(!input.publishSignals?.length ? ["publishSignals"] : []),
  ];
}

function confidenceFor(input: LearningInput, signalCount: number): LearningConfidence {
  const signals = [Boolean(input.creativeLibraryResult), Boolean(input.criticResult), Boolean(input.similarityResult), Boolean(input.repairResult), Boolean(input.selfPlayResult), Boolean(input.userEditSignals?.length), Boolean(input.publishSignals?.length)];
  const score = Math.max(0.2, Math.min(1, signals.filter(Boolean).length / signals.length * 0.7 + Math.min(signalCount, 20) / 100));
  return Object.freeze({ score: Number(score.toFixed(2)), reasons: [`Learning sources present: ${signals.filter(Boolean).length}/${signals.length}.`, `Signal count: ${signalCount}.`] });
}

function metricsFor(result: Omit<LearningResult, "metrics">): LearningMetrics {
  return Object.freeze({
    recordCount: result.learningRecords.length,
    signalCount: result.rankingSignals.length,
    warningCount: result.warnings.length,
    missingTelemetryCount: result.aggregationSummary.missingTelemetry.length,
    metadataOnly: true as const,
    persisted: false as const,
    builderMutations: false as const,
    mapperExecuted: false as const,
  });
}

/**
 * Runs the metadata-only Learning Engine.
 *
 * @example
 * const result = runLearningEngine({ criticResult, selfPlayResult });
 */
export function runLearningEngine(input: LearningInput = {}): EngineResult<LearningResult> {
  const inputValidation = validateLearningInput(input);
  const generationHistory = buildGenerationHistory(input);
  const patternSignals = extractPatternLearningSignals(input);
  const recipeSignals = extractRecipeLearningSignals(input);
  const fragmentSignals = extractFragmentLearningSignals(input);
  const designDnaSignals = extractDesignDnaLearningSignals(input);
  const criticSignals = extractCriticLearningSignals(input);
  const repairSignals = extractRepairLearningSignals(input);
  const similaritySignals = extractSimilarityLearningSignals(input);
  const selfPlaySignals = extractSelfPlayLearningSignals(input);
  const rankingSignals = [
    ...extractRankingSignals(input),
    ...patternSignals,
    ...recipeSignals,
    ...fragmentSignals,
    ...designDnaSignals,
    ...criticSignals,
    ...repairSignals,
    ...similaritySignals,
    ...selfPlaySignals,
  ];
  const aggregationSummary = aggregateLearningSignals(rankingSignals, missingTelemetry(input));
  const learningRecords = buildLearningRecords(rankingSignals);
  const warnings = inputValidation.issues.map((issue) => createEngineWarning("LEARNING_INPUT_WARNING", issue, "learning", "minor"));
  const baseResult = {
    id: `learning.${input.compiledPlan?.id ?? input.websiteSpec?.id ?? "metadata"}`,
    version: LEARNING_ENGINE_VERSION_STRING,
    learningRecords,
    generationHistory,
    rankingSignals,
    patternSignals,
    recipeSignals,
    fragmentSignals,
    designDnaSignals,
    criticSignals,
    repairSignals,
    similaritySignals,
    selfPlaySignals,
    aggregationSummary,
    warnings,
    confidence: confidenceFor(input, rankingSignals.length),
    trace: [
      "learning.metadata-only",
      "no-db-writes",
      "no-persistence",
      "no-builder-mutation",
      "no-mapper-execution",
      "no-network-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: { inputValidationIssues: inputValidation.issues },
    persisted: false as const,
    builderMutations: false as const,
    mapperExecuted: false as const,
  };
  const result = Object.freeze({ ...baseResult, metrics: metricsFor(baseResult) });
  const validation = validateLearningResult(result);
  const finalWarnings = validation.valid ? warnings : [...warnings, ...validation.issues.map((issue) => createEngineWarning("LEARNING_RESULT_WARNING", issue, "learning", "major"))];
  const finalResult = Object.freeze({ ...result, warnings: finalWarnings, metrics: metricsFor({ ...result, warnings: finalWarnings }) });

  return createEngineResult({
    module: "learning",
    stage: "metadata-signal-extraction",
    data: finalResult,
    status: finalWarnings.length ? "warning" : "ok",
    warnings: finalWarnings,
    metadata: { phase: "PHASE_37_LEARNING_ENGINE", metadataOnly: true, signalCount: rankingSignals.length },
    confidence: finalResult.confidence.score,
  });
}
