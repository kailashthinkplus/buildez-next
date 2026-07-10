import type { QualityTarget, SelfPlayInput } from "./selfPlayResult";

/**
 * Builds the self-play quality target from input defaults.
 *
 * @example
 * const target = buildQualityTarget({ targetScore: 95 });
 */
export function buildQualityTarget(input: SelfPlayInput = {}): QualityTarget {
  return Object.freeze({
    score: Math.max(0, Math.min(100, Math.round(input.targetScore ?? 95))),
    maxIterations: Math.max(1, Math.min(10, Math.round(input.maxIterations ?? 3))),
    allowedSimilarity: 0.7,
    minimumImprovement: 1,
  });
}
