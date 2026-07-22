import type { ShadowEditabilityComparison, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareHigherIsBetter } from "./comparisonMetrics";

/**
 * Compares provided editability scores.
 *
 * @example
 * const comparison = compareEditability(v9, v10);
 */
export function compareEditability(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowEditabilityComparison {
  return Object.freeze({ ...compareHigherIsBetter("editability", "Editability", v9.editabilityScore, v10.editabilityScore, "editability score"), category: "editability" });
}
