import type { RepairPlan } from "../repair";
import type { SelfPlayInput, OptimizationScore } from "./selfPlayResult";

function normalized(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Scores optimization candidate metadata.
 *
 * @example
 * const score = scoreOptimizationCandidate(input, repairPlan);
 */
export function scoreOptimizationCandidate(input: SelfPlayInput, repairPlan?: RepairPlan, previousScore = 0): OptimizationScore {
  const criticScore = input.evolutionResult?.winner.score.criticScore ?? input.criticResult?.overallScore ?? 80;
  const diversityScore = input.evolutionResult?.winner.score.diversityScore ?? input.similarityResult?.overallDiversityScore.score ?? 75;
  const repairImpact = repairPlan?.expectedImpact ?? input.repairResult?.plan.expectedImpact ?? 0;
  const riskPenalty = (repairPlan?.risk ?? input.repairResult?.plan.risk) === "high" ? 14 : (repairPlan?.risk ?? input.repairResult?.plan.risk) === "medium" ? 7 : 0;
  const repairBoost = Math.min(18, repairImpact * 0.45);
  const overallScore = normalized(Math.max(previousScore, criticScore * 0.45 + diversityScore * 0.35 + repairBoost - riskPenalty + 12));
  return Object.freeze({
    overallScore,
    criticScore: normalized(criticScore),
    diversityScore: normalized(diversityScore),
    repairImpact: normalized(repairImpact),
    riskPenalty: normalized(riskPenalty),
    reasons: [`Critic score: ${normalized(criticScore)}.`, `Diversity score: ${normalized(diversityScore)}.`, `Repair impact: ${normalized(repairImpact)}.`],
  });
}
