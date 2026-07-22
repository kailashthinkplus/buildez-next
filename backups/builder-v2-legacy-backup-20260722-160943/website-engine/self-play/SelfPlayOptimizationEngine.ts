import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runOptimizationLoop } from "./optimizationLoop";
import { buildOptimizationTrace } from "./optimizationTrace";
import { buildQualityTarget } from "./qualityTarget";
import type { SelfPlayConfidence, SelfPlayInput, SelfPlayMetrics, SelfPlayResult } from "./selfPlayResult";
import { validateSelfPlayInput, validateSelfPlayResult } from "./validation";
import { SELF_PLAY_VERSION_STRING } from "./version";

function confidenceFor(input: SelfPlayInput, iterationCount: number): SelfPlayConfidence {
  const signals = [Boolean(input.evolutionResult || input.winner), Boolean(input.criticResult), Boolean(input.similarityResult), Boolean(input.repairResult), Boolean(input.simulationResult)];
  const score = Math.max(0.25, Math.min(1, signals.filter(Boolean).length / signals.length * 0.75 + Math.min(iterationCount, 3) * 0.08));
  return Object.freeze({ score: Number(score.toFixed(2)), reasons: [`Self-play signals: ${signals.filter(Boolean).length}/${signals.length}.`, `Iterations: ${iterationCount}.`] });
}

function metricsFor(result: Omit<SelfPlayResult, "metrics">): SelfPlayMetrics {
  const progression = result.overallOptimizationScoreProgression;
  return Object.freeze({
    iterationCount: result.iterationHistory.length,
    repairApplicationCount: result.appliedRepairPlanMetadata.length,
    warningCount: result.warnings.length,
    initialScore: progression[0] ?? 0,
    finalScore: progression[progression.length - 1] ?? 0,
    metadataOnly: true as const,
    builderMutations: false as const,
    mapperExecuted: false as const,
    rendered: false as const,
    codeGenerated: false as const,
  });
}

function remainingRisksFor(result: Pick<SelfPlayResult, "stoppingReason" | "bestCandidate">): string[] {
  const risks = [];
  if (result.stoppingReason === "repair-requires-missing-facts-or-assets") risks.push("Repair requires missing facts or assets; do not invent them.");
  if (result.stoppingReason === "diversity-worsened-above-threshold") risks.push("Diversity worsened above the allowed similarity threshold.");
  if (result.bestCandidate.score.overallScore < 95) risks.push("Best candidate remains below default target score.");
  return risks;
}

/**
 * Runs deterministic metadata-only Self-Play Optimization.
 *
 * @example
 * const result = runSelfPlayOptimization({ evolutionResult, repairResult });
 */
export function runSelfPlayOptimization(input: SelfPlayInput = {}): EngineResult<SelfPlayResult> {
  const inputValidation = validateSelfPlayInput(input);
  const target = buildQualityTarget(input);
  const loop = runOptimizationLoop(input);
  const bestIteration = [...loop.iterations].sort((left, right) => right.overallScore - left.overallScore || left.iteration - right.iteration)[0];
  const optimizationTrace = buildOptimizationTrace(loop.iterations);
  const baseWarnings = inputValidation.issues.map((issue) => createEngineWarning("SELF_PLAY_INPUT_WARNING", issue, "self-play", "minor"));
  const baseResult = {
    id: `self-play.${input.evolutionResult?.winner.candidate.id ?? input.winner?.candidate.id ?? "metadata"}`,
    version: SELF_PLAY_VERSION_STRING,
    bestCandidate: bestIteration.candidate,
    iterationHistory: loop.iterations,
    appliedRepairPlanMetadata: loop.iterations.flatMap((iteration) => iteration.repairApplication ? [iteration.repairApplication] : []),
    criticScoreProgression: loop.iterations.map((iteration) => iteration.criticScore),
    similarityScoreProgression: loop.iterations.map((iteration) => iteration.similarityScore),
    diversityScoreProgression: loop.iterations.map((iteration) => iteration.diversityScore),
    overallOptimizationScoreProgression: loop.iterations.map((iteration) => iteration.overallScore),
    stoppingReason: loop.stoppingReason,
    finalRecommendation: bestIteration.overallScore >= target.score ? "Proceed to next metadata phase." : "Keep candidate in metadata optimization before Builder handoff.",
    remainingRisks: [] as string[],
    warnings: baseWarnings,
    confidence: confidenceFor(input, loop.iterations.length),
    optimizationTrace,
    trace: [
      "self-play.metadata-only",
      "repair-application-is-simulation",
      "no-builder-store-mutation",
      "no-mapper-execution",
      "no-rendering-or-screenshots",
      "no-code-generation",
      "no-network-db-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: { targetScore: target.score, maxIterations: target.maxIterations, inputValidationIssues: inputValidation.issues },
    appliedToBuilder: false as const,
    mapperExecuted: false as const,
    rendered: false as const,
    codeGenerated: false as const,
  };
  const resultWithRisks = Object.freeze({ ...baseResult, remainingRisks: remainingRisksFor(baseResult) });
  const result = Object.freeze({ ...resultWithRisks, metrics: metricsFor(resultWithRisks) });
  const validation = validateSelfPlayResult(result);
  const warnings = validation.valid ? baseWarnings : [...baseWarnings, ...validation.issues.map((issue) => createEngineWarning("SELF_PLAY_RESULT_WARNING", issue, "self-play", "major"))];
  const finalResult = Object.freeze({ ...result, warnings, metrics: metricsFor({ ...result, warnings }) });

  return createEngineResult({
    module: "self-play",
    stage: "optimization-loop",
    data: finalResult,
    status: warnings.length ? "warning" : "ok",
    warnings,
    metadata: { phase: "PHASE_36_5_SELF_PLAY_OPTIMIZATION_ENGINE", metadataOnly: true, stoppingReason: loop.stoppingReason },
    confidence: finalResult.confidence.score,
  });
}
