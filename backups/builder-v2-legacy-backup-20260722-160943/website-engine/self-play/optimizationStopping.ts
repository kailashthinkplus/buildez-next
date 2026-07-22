import type { OptimizationIteration, OptimizationStoppingReason, QualityTarget } from "./selfPlayResult";

/**
 * Evaluates deterministic self-play stopping conditions.
 *
 * @example
 * const reason = evaluateStoppingCondition(history, target);
 */
export function evaluateStoppingCondition(iterations: readonly OptimizationIteration[], target: QualityTarget): OptimizationStoppingReason | null {
  const latest = iterations[iterations.length - 1];
  const previous = iterations[iterations.length - 2];
  if (!latest) return null;
  if (latest.overallScore >= target.score) return "target-score-reached";
  if (latest.repairApplication?.requiresMissingFactsOrAssets) return "repair-requires-missing-facts-or-assets";
  if (latest.similarityScore > target.allowedSimilarity * 100) return "diversity-worsened-above-threshold";
  if (previous && latest.improvement < target.minimumImprovement) return "no-meaningful-improvement";
  if (iterations.length >= target.maxIterations) return "max-iterations-reached";
  return null;
}
