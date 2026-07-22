import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates asset readiness, truth policy, and substitution policy metadata.
 *
 * @example
 * const result = runAssetCritic({ mediaStrategy, simulationResult });
 */
export function runAssetCritic(input: CriticInput): CriticCategoryResult {
  const media = input.mediaStrategy;
  const requiredMissingWithoutSubstitution = media?.assetRequirements.filter((requirement) => requirement.required && requirement.missing && !requirement.substitutionAllowed).length ?? 0;
  const missingAssetCount = media?.assetReadiness.missingRequiredCount ?? input.simulationResult?.assetResult.missingAssetCount ?? input.missingAssets?.length ?? 0;
  const readiness = media?.assetReadiness.score ?? input.simulationResult?.assetResult.score ?? 78;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (requiredMissingWithoutSubstitution > 0) {
    hardFailures.push(hardFailure("asset-readiness", "MISSING_REQUIRED_ASSETS_WITHOUT_SUBSTITUTION_POLICY", "Required assets are missing without an allowed substitution policy.", "Request real assets, allow explicit omission, or define a safe substitution policy."));
  }
  if (missingAssetCount > 0) {
    issues.push(metadataIssue("asset-readiness", "major", "Missing assets remain unresolved.", "Keep missing assets explicit and block unsafe substitutions."));
  }
  if (!media?.truthPolicy) {
    recommendations.push(repairRecommendation("asset-readiness", "high", "Add media truth policy.", "Define which assets must be real and which can be omitted or substituted."));
  }

  return createCategoryResult("asset-readiness", readiness, [
    `Missing required asset count: ${missingAssetCount}.`,
    `Missing without substitution policy: ${requiredMissingWithoutSubstitution}.`,
  ], issues, hardFailures, recommendations, 1.1);
}
