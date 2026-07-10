import type { ShadowPerformanceComparison, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareLowerIsBetter } from "./comparisonMetrics";

/**
 * Compares provided performance-risk scores.
 *
 * @example
 * const comparison = comparePerformanceRisk(v9, v10);
 */
export function comparePerformanceRisk(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowPerformanceComparison {
  return Object.freeze({ ...compareLowerIsBetter("performance-risk", "Performance risk", v9.performanceRisk, v10.performanceRisk, "performance risk"), category: "performance-risk" });
}
