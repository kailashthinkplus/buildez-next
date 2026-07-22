import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { compareCandidates } from "./candidateComparison";
import { generateWebsiteCandidates } from "./candidateGenerator";
import { rankCandidates } from "./candidateRanking";
import { scoreCandidates } from "./candidateScoring";
import { buildRepairPriority, buildRunnerUps, selectWinningCandidate } from "./candidateSelection";
import { validateEvolutionInput, validateEvolutionResult } from "./candidateValidation";
import type { EvolutionConfidence, EvolutionInput, EvolutionMetrics, EvolutionResult } from "./candidateVariants";
import { CANDIDATE_EVOLUTION_VERSION_STRING } from "./version";

function collectConfidence(input: EvolutionInput, candidateCount: number): EvolutionConfidence {
  const signals = [
    Boolean(input.creativeLibraryResult),
    Boolean(input.designDNA),
    Boolean(input.recipeAssemblyResults?.length),
    Boolean(input.componentResult),
    Boolean(input.compositionResult),
    Boolean(input.compiledPlan),
    Boolean(input.criticResult),
    Boolean(input.similarityResult),
  ];
  const score = Math.max(0.25, Math.min(1, signals.filter(Boolean).length / signals.length));
  return Object.freeze({
    score: Number(score.toFixed(2)),
    reasons: [`Evolution upstream signals present: ${signals.filter(Boolean).length}/${signals.length}.`, `Candidate count: ${candidateCount}.`],
  });
}

function collectMetrics(result: Omit<EvolutionResult, "metrics">): EvolutionMetrics {
  return Object.freeze({
    candidateCount: result.candidates.length,
    mutationCount: result.candidates.reduce((sum, candidate) => sum + candidate.profile.mutations.length, 0),
    comparisonCount: result.comparisons.length,
    warningCount: result.warnings.length,
    runnerUpCount: result.runnerUps.length,
    metadataOnly: true as const,
    rendered: false as const,
    persisted: false as const,
    builderNodesCreated: false as const,
    mapperExecuted: false as const,
  });
}

/**
 * Runs deterministic metadata-only Candidate Evolution.
 *
 * @example
 * const result = runCandidateEvolution({ criticResult, similarityResult });
 */
export function runCandidateEvolution(input: EvolutionInput = {}): EngineResult<EvolutionResult> {
  const inputValidation = validateEvolutionInput(input);
  const candidates = generateWebsiteCandidates(input);
  const comparisons = compareCandidates(candidates);
  const candidateScores = scoreCandidates(candidates, input, comparisons);
  const ranking = rankCandidates(candidates, candidateScores);
  const winner = selectWinningCandidate(ranking);
  const runnerUps = buildRunnerUps(ranking);
  const repairPriority = buildRepairPriority(winner);
  const warnings = inputValidation.issues.map((issue) => createEngineWarning("EVOLUTION_INPUT_WARNING", issue, "evolution", "minor"));
  const baseResult = {
    id: `evolution.${input.compiledPlan?.id ?? input.websiteSpec?.id ?? "metadata"}`,
    version: CANDIDATE_EVOLUTION_VERSION_STRING,
    winner,
    runnerUps,
    candidates,
    candidateScores,
    criticScores: Object.freeze(Object.fromEntries(candidateScores.map((score) => [score.candidateId, score.criticScore]))),
    similarityScores: Object.freeze(Object.fromEntries(candidateScores.map((score) => [score.candidateId, score.similarityScore]))),
    ranking,
    comparisons,
    selectionReason: winner.selectionReason,
    repairPriority,
    warnings,
    confidence: collectConfidence(input, candidates.length),
    trace: [
      "evolution.metadata-only",
      "minimum-five-candidates",
      "no-rendering",
      "no-screenshot-capture",
      "no-builder-node-creation",
      "no-mapper-execution",
      "no-html-css-react-js-generation",
      "no-network-db-llm-mcp-provider-calls",
      "feature-flags-remain-false",
    ],
    metadata: {
      mutationDimensions: candidates.flatMap((candidate) => candidate.profile.mutations.map((mutation) => mutation.kind)),
      inputValidationIssues: inputValidation.issues,
    },
    rendered: false as const,
    persisted: false as const,
    builderNodesCreated: false as const,
    mapperExecuted: false as const,
  };
  const result = Object.freeze({ ...baseResult, metrics: collectMetrics(baseResult) });
  const validation = validateEvolutionResult(result);

  return createEngineResult({
    module: "evolution",
    stage: "candidate-evolution",
    data: result,
    status: validation.valid && !warnings.length ? "ok" : "warning",
    warnings: validation.valid ? warnings : [...warnings, ...validation.issues.map((issue) => createEngineWarning("EVOLUTION_RESULT_WARNING", issue, "evolution", "major"))],
    metadata: {
      phase: "PHASE_35_75_CANDIDATE_EVOLUTION_ENGINE",
      metadataOnly: true,
      candidateCount: candidates.length,
      winnerId: winner.candidate.id,
    },
    confidence: result.confidence.score,
  });
}
