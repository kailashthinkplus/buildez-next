import type { LuxuryScale, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

function bounded(score: number) {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

/**
 * Infers luxury level.
 *
 * @example
 * const luxury = inferLuxuryScale(input, context);
 */
export function inferLuxuryScale(input: VisualMoodInput, context: VisualMoodFamilyContext): LuxuryScale {
  const score = bounded(
    0.35 +
    (input.brandProfile?.premiumLevel === "luxury" ? 0.4 : 0) +
    (input.brandProfile?.premiumLevel === "premium" ? 0.24 : 0) +
    (context.family === "real_estate" || context.family === "hospitality" || context.family === "architecture_interiors" ? 0.18 : 0) +
    (context.corpus.includes("luxury") ? 0.12 : 0)
  );
  return Object.freeze({ level: score >= 0.82 ? "very high" : score >= 0.66 ? "high" : score >= 0.45 ? "medium" : "low", score });
}
