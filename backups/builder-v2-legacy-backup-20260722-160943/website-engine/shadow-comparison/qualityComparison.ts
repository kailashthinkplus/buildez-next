import type { ShadowQualityComparison, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareHigherIsBetter } from "./comparisonMetrics";

/**
 * Compares provided quality scores.
 *
 * @example
 * const comparison = compareQuality(v9, v10);
 */
export function compareQuality(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowQualityComparison {
  return Object.freeze({ ...compareHigherIsBetter("quality", "Quality", v9.qualityScore, v10.qualityScore, "quality score"), category: "quality" });
}
