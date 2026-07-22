import type { OptimizationIteration, OptimizationTrace } from "./selfPlayResult";

/**
 * Builds self-play trace metadata.
 *
 * @example
 * const trace = buildOptimizationTrace(iterations);
 */
export function buildOptimizationTrace(iterations: readonly OptimizationIteration[]): OptimizationTrace {
  return Object.freeze({
    events: [
      "self-play.metadata-only",
      ...iterations.map((iteration) => `iteration.${iteration.iteration}.score.${iteration.overallScore}`),
      "no-builder-mutation",
      "no-mapper-execution",
      "no-rendering-or-screenshots",
    ],
    metadata: {
      iterationCount: iterations.length,
      finalScore: iterations[iterations.length - 1]?.overallScore ?? 0,
    },
  });
}
