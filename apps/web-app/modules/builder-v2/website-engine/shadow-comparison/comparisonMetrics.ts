import type { ShadowCategoryComparison, ShadowComparisonMetric, ShadowComparisonWinner } from "./shadowResult";

function winnerFromNumbers(v9: number, v10: number, higherIsBetter: boolean): ShadowComparisonWinner {
  if (v9 === v10) return "tie";
  return higherIsBetter ? (v10 > v9 ? "v10" : "v9") : (v10 < v9 ? "v10" : "v9");
}

function normalizeBoolean(value: boolean | undefined): number | undefined {
  if (value === undefined) return undefined;
  return value ? 1 : 0;
}

/**
 * Builds a comparison metric.
 *
 * @example
 * const metric = buildComparisonMetric("Quality", true, 70, 80, []);
 */
export function buildComparisonMetric(label: string, higherIsBetter: boolean, v9Value: number | boolean | undefined, v10Value: number | boolean | undefined, missingSignals: string[]): ShadowComparisonMetric {
  return Object.freeze({
    label,
    complete: v9Value !== undefined && v10Value !== undefined,
    higherIsBetter,
    v9Value,
    v10Value,
    missingSignals,
  });
}

/**
 * Compares a higher-is-better numeric signal.
 *
 * @example
 * const comparison = compareHigherIsBetter("quality", "Quality", 70, 80, "quality score");
 */
export function compareHigherIsBetter(category: ShadowCategoryComparison["category"], label: string, v9Value: number | undefined, v10Value: number | undefined, signalName: string): ShadowCategoryComparison {
  const missingSignals = [v9Value === undefined ? `ai-v9 ${signalName}` : undefined, v10Value === undefined ? `v10 ${signalName}` : undefined].filter(Boolean) as string[];
  const complete = missingSignals.length === 0;
  const winner = complete ? winnerFromNumbers(v9Value as number, v10Value as number, true) : "incomplete";
  return Object.freeze({
    category,
    metric: buildComparisonMetric(label, true, v9Value, v10Value, missingSignals),
    winner,
    reasons: complete ? [`Compared ${label.toLowerCase()} using provided metadata only.`] : [`Missing ${missingSignals.join(", ")}.`],
  });
}

/**
 * Compares a lower-is-better numeric risk signal.
 *
 * @example
 * const comparison = compareLowerIsBetter("performance-risk", "Performance risk", 20, 10, "performance risk");
 */
export function compareLowerIsBetter(category: ShadowCategoryComparison["category"], label: string, v9Value: number | undefined, v10Value: number | undefined, signalName: string): ShadowCategoryComparison {
  const missingSignals = [v9Value === undefined ? `ai-v9 ${signalName}` : undefined, v10Value === undefined ? `v10 ${signalName}` : undefined].filter(Boolean) as string[];
  const complete = missingSignals.length === 0;
  const winner = complete ? winnerFromNumbers(v9Value as number, v10Value as number, false) : "incomplete";
  return Object.freeze({
    category,
    metric: buildComparisonMetric(label, false, v9Value, v10Value, missingSignals),
    winner,
    reasons: complete ? [`Compared ${label.toLowerCase()} using provided metadata only.`] : [`Missing ${missingSignals.join(", ")}.`],
  });
}

/**
 * Compares a boolean compatibility signal.
 *
 * @example
 * const comparison = compareBooleanCompatibility("native-builder-compatibility", "Native compatibility", true, false, "native Builder compatibility");
 */
export function compareBooleanCompatibility(category: ShadowCategoryComparison["category"], label: string, v9Value: boolean | undefined, v10Value: boolean | undefined, signalName: string): ShadowCategoryComparison {
  const missingSignals = [v9Value === undefined ? `ai-v9 ${signalName}` : undefined, v10Value === undefined ? `v10 ${signalName}` : undefined].filter(Boolean) as string[];
  const complete = missingSignals.length === 0;
  const v9Number = normalizeBoolean(v9Value);
  const v10Number = normalizeBoolean(v10Value);
  const winner = complete ? winnerFromNumbers(v9Number as number, v10Number as number, true) : "incomplete";
  return Object.freeze({
    category,
    metric: buildComparisonMetric(label, true, v9Value, v10Value, missingSignals),
    winner,
    reasons: complete ? [`Compared ${label.toLowerCase()} using provided metadata only.`] : [`Missing ${missingSignals.join(", ")}.`],
  });
}
