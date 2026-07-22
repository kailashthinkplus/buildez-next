import type { CinematicScale, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

function bounded(score: number) {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

/**
 * Infers cinematic level.
 *
 * @example
 * const cinematic = inferCinematicScale(input, context);
 */
export function inferCinematicScale(input: VisualMoodInput, context: VisualMoodFamilyContext): CinematicScale {
  const score = bounded(
    0.35 +
    (context.corpus.includes("cinematic") ? 0.28 : 0) +
    (context.family === "automotive" || context.family === "hospitality" || context.family === "real_estate" ? 0.18 : 0) +
    (input.designResult?.motionProfile.level === "medium" ? 0.08 : 0)
  );
  return Object.freeze({ level: score >= 0.67 ? "high" : score >= 0.42 ? "medium" : "low", score });
}
