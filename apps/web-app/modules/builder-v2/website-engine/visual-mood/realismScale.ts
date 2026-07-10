import type { RealismScale, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

function bounded(score: number) {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

/**
 * Infers realism level.
 *
 * @example
 * const realism = inferRealismScale(input, context);
 */
export function inferRealismScale(input: VisualMoodInput, context: VisualMoodFamilyContext): RealismScale {
  const score = bounded(
    0.72 +
    ((input.knownImagery?.length ?? 0) > 0 ? 0.08 : 0) -
    (context.corpus.includes("illustration") ? 0.22 : 0)
  );
  return Object.freeze({ level: score >= 0.66 ? "realistic" : score >= 0.4 ? "stylized" : "abstract", score });
}
