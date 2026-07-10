import type { ShadowSimilarityComparison, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareHigherIsBetter } from "./comparisonMetrics";

/**
 * Compares provided similarity/diversity scores.
 *
 * @example
 * const comparison = compareSimilarity(v9, v10);
 */
export function compareSimilarity(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowSimilarityComparison {
  return Object.freeze({ ...compareHigherIsBetter("similarity-diversity", "Similarity and diversity", v9.diversityScore, v10.diversityScore, "diversity score"), category: "similarity-diversity" });
}
