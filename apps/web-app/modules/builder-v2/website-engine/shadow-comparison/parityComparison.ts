import type { ShadowParityComparison, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareHigherIsBetter } from "./comparisonMetrics";

/**
 * Compares provided renderer parity scores.
 *
 * @example
 * const comparison = compareRendererParity(v9, v10);
 */
export function compareRendererParity(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowParityComparison {
  return Object.freeze({ ...compareHigherIsBetter("renderer-parity", "Renderer parity", v9.rendererParityScore, v10.rendererParityScore, "renderer parity score"), category: "renderer-parity" });
}
