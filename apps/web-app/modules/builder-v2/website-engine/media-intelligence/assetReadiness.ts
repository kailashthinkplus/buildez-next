import type { MediaAssetRequirement, MediaReadinessScore } from "./mediaStrategy";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

/**
 * Scores asset readiness from normalized requirements.
 *
 * @example
 * const readiness = scoreAssetReadiness(requirements, ["logo"]);
 */
export function scoreAssetReadiness(requirements: readonly MediaAssetRequirement[], knownAssets: readonly string[] = []): MediaReadinessScore {
  const required = requirements.filter((item) => item.required);
  const missingRequired = required.filter((item) => item.missing);
  const score = bounded(required.length ? 1 - missingRequired.length / required.length : 1);
  return Object.freeze({
    score,
    knownAssetCount: knownAssets.length,
    missingRequiredCount: missingRequired.length,
    requiredCount: required.length,
    reasons: [`required=${required.length}`, `missingRequired=${missingRequired.length}`, `knownAssets=${knownAssets.length}`],
  });
}
