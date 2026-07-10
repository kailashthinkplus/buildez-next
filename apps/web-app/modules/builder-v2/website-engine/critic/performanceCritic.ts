import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates performance risk from simulation, media, and motion metadata.
 *
 * @example
 * const result = runPerformanceCritic({ simulationResult, mediaStrategy });
 */
export function runPerformanceCritic(input: CriticInput): CriticCategoryResult {
  const performance = input.simulationResult?.performanceResult;
  const score = performance?.score ?? 80;
  const heavyAssetRisk = performance?.heavyAssetRisk ?? Math.min(0.5, (input.mediaStrategy?.assetRequirements.length ?? 0) / 30);
  const motionRisk = performance?.motionRisk ?? (input.motionStrategy?.performanceProfile.budget === "expressive" ? 0.45 : 0.15);
  const issues = [];
  const recommendations = [];

  if (heavyAssetRisk > 0.5) {
    issues.push(metadataIssue("performance", "major", "Heavy asset risk is high.", "Reduce required media weight or defer non-critical assets."));
  }
  if (motionRisk > 0.45) {
    issues.push(metadataIssue("performance", "major", "Motion metadata indicates elevated performance risk.", "Constrain motion budget and prefer static or reduced effects."));
  }
  if (score < 85) {
    recommendations.push(repairRecommendation("performance", "medium", "Improve performance metadata.", "Lower asset count, motion intensity, or node count before mapping."));
  }

  return createCategoryResult("performance", score - heavyAssetRisk * 8 - motionRisk * 6, [
    `Performance simulation score: ${score}.`,
    `Heavy asset risk: ${heavyAssetRisk.toFixed(2)}.`,
  ], issues, [], recommendations);
}
