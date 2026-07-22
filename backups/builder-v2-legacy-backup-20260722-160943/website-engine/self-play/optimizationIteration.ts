import { buildRepairPlan, type RepairPlan } from "../repair";
import { buildOptimizationCandidate } from "./optimizationCandidate";
import { applyRepairPlanMetadata } from "./repairPlanApplication";
import type { OptimizationIteration, SelfPlayInput } from "./selfPlayResult";

/**
 * Runs one metadata-only optimization iteration.
 *
 * @example
 * const iteration = runOptimizationIteration(input, 1);
 */
export function runOptimizationIteration(input: SelfPlayInput, iteration: number, previous?: OptimizationIteration): OptimizationIteration {
  const repairPlan: RepairPlan = input.repairResult?.plan ?? buildRepairPlan({
    evolutionResult: input.evolutionResult,
    winner: input.winner,
    criticResult: input.criticResult,
    similarityResult: input.similarityResult,
    simulationResult: input.simulationResult,
    websiteSpec: input.websiteSpec,
    websiteDNA: input.websiteDNA,
    designDNA: input.designDNA,
    creativeLibraryResult: input.creativeLibraryResult,
    recipeAssemblyResults: input.recipeAssemblyResults,
    compiledPlan: input.compiledPlan,
    builderBlueprintResult: input.builderBlueprintResult,
    mappingPlan: input.mappingPlan,
    componentResult: input.componentResult,
    compositionResult: input.compositionResult,
    featureFlags: input.featureFlags,
  });
  const candidateBeforeRepair = buildOptimizationCandidate(input, repairPlan, previous?.overallScore ?? 0);
  const application = applyRepairPlanMetadata(candidateBeforeRepair, repairPlan, iteration);
  const adjustedInput = {
    ...input,
    criticResult: input.criticResult,
  };
  const candidate = buildOptimizationCandidate(adjustedInput, repairPlan, (previous?.overallScore ?? candidateBeforeRepair.score.overallScore) + application.expectedScoreDelta);
  const similarityScore = Math.max(0, Math.min(100, input.similarityResult ? input.similarityResult.overallSimilarityScore * 100 + iteration * 2 : 35 + iteration * 2));
  const diversityScore = Math.max(0, Math.min(100, candidate.score.diversityScore - iteration));
  const overallScore = Math.max(0, Math.min(100, Math.round(candidate.score.overallScore + application.expectedScoreDelta * 0.5)));
  return Object.freeze({
    iteration,
    candidate,
    repairApplication: application,
    criticScore: candidate.score.criticScore,
    similarityScore,
    diversityScore,
    overallScore,
    improvement: overallScore - (previous?.overallScore ?? 0),
    notes: [
      `Applied repair metadata from ${repairPlan.id}.`,
      `Expected score delta: ${application.expectedScoreDelta}.`,
    ],
  });
}
