import type { RepairPlan } from "../repair";
import type { SelfPlayInput, OptimizationCandidate } from "./selfPlayResult";
import { scoreOptimizationCandidate } from "./optimizationScoring";

/**
 * Builds the current optimization candidate from Evolution winner metadata.
 *
 * @example
 * const candidate = buildOptimizationCandidate(input);
 */
export function buildOptimizationCandidate(input: SelfPlayInput, repairPlan?: RepairPlan, previousScore = 0): OptimizationCandidate {
  const sourceCandidate = input.evolutionResult?.winner.candidate ?? input.winner?.candidate;
  const score = scoreOptimizationCandidate(input, repairPlan, previousScore);
  return Object.freeze({
    id: `optimization.candidate.${sourceCandidate?.id ?? "metadata"}.${score.overallScore}`,
    sourceCandidate,
    score,
    repairPlan,
    metadata: {
      sourceCandidateId: sourceCandidate?.id ?? null,
      repairPlanId: repairPlan?.id ?? null,
    },
    appliedToBuilder: false as const,
    rendered: false as const,
    codeGenerated: false as const,
  });
}
