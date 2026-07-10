import type { ShadowCategoryComparison, ShadowRiskComparison, ShadowWinner, V10ShadowArtifact, V9ShadowArtifact } from "./shadowResult";
import { compareBooleanCompatibility, compareHigherIsBetter, compareLowerIsBetter } from "./comparisonMetrics";

/**
 * Compares provided safety-risk scores.
 *
 * @example
 * const comparison = compareSafetyRisk(v9, v10);
 */
export function compareSafetyRisk(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowRiskComparison {
  return Object.freeze({ ...compareLowerIsBetter("safety-risk", "Safety and truth risk", v9.safetyRisk, v10.safetyRisk, "safety risk"), category: "safety-risk" });
}

/**
 * Compares provided native Builder compatibility flags.
 *
 * @example
 * const comparison = compareNativeBuilderCompatibility(v9, v10);
 */
export function compareNativeBuilderCompatibility(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowCategoryComparison {
  return compareBooleanCompatibility("native-builder-compatibility", "Native Builder compatibility", v9.nativeBuilderCompatible, v10.nativeBuilderCompatible, "native Builder compatibility");
}

/**
 * Compares provided repairability scores.
 *
 * @example
 * const comparison = compareRepairability(v9, v10);
 */
export function compareRepairability(v9: V9ShadowArtifact, v10: V10ShadowArtifact): ShadowCategoryComparison {
  return compareHigherIsBetter("repairability", "Repairability", v9.repairabilityScore, v10.repairabilityScore, "repairability score");
}

/**
 * Selects a conservative shadow winner from complete comparison categories.
 *
 * @example
 * const winner = selectShadowWinner(comparisons);
 */
export function selectShadowWinner(comparisons: readonly ShadowCategoryComparison[]): ShadowWinner {
  const complete = comparisons.filter((comparison) => comparison.winner !== "incomplete");
  if (!complete.length) {
    return Object.freeze({
      winner: "incomplete",
      rolloutReadiness: "not_ready",
      recommendation: "Collect ai-v9 and v10 metadata artifacts before making rollout decisions.",
      reasons: ["No complete comparison categories were available."],
    });
  }
  const v9Wins = complete.filter((comparison) => comparison.winner === "v9").length;
  const v10Wins = complete.filter((comparison) => comparison.winner === "v10").length;
  const ties = complete.filter((comparison) => comparison.winner === "tie").length;
  const winner = v10Wins > v9Wins ? "v10" : v9Wins > v10Wins ? "v9" : "tie";
  const critical = comparisons.filter((comparison) => ["safety-risk", "renderer-parity", "native-builder-compatibility"].includes(comparison.category));
  const criticalIncomplete = critical.some((comparison) => comparison.winner === "incomplete");
  const rolloutReadiness =
    winner === "v10" && !criticalIncomplete && v10Wins >= v9Wins + 2
      ? "ready_for_internal_preview"
      : winner === "v10"
        ? "manual_review"
        : winner === "tie"
          ? "shadow_only"
          : "not_ready";
  return Object.freeze({
    winner,
    rolloutReadiness,
    recommendation:
      rolloutReadiness === "ready_for_internal_preview"
        ? "v10 metadata is stronger across enough provided categories for an internal preview harness."
        : rolloutReadiness === "manual_review"
          ? "Review critical categories manually before any broader rollout."
          : rolloutReadiness === "shadow_only"
            ? "Continue shadow collection; v10 has not clearly outperformed ai-v9."
            : "Do not roll out v10 yet; ai-v9 remains safer or the comparison is incomplete.",
    reasons: [`v10 wins: ${v10Wins}.`, `ai-v9 wins: ${v9Wins}.`, `ties: ${ties}.`, `complete categories: ${complete.length}.`],
  });
}
