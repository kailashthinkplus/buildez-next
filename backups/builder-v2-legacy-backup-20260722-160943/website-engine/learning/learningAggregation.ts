import type { LearningAggregation, RankingSignal } from "./learningResult";

export function aggregateLearningSignals(signals: readonly RankingSignal[], missingTelemetry: readonly string[]): LearningAggregation {
  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0) || 1;
  const weightedScore = Number((signals.reduce((sum, signal) => sum + signal.score * signal.weight, 0) / totalWeight).toFixed(3));
  const sorted = [...signals].sort((left, right) => right.score * right.weight - left.score * left.weight);
  return Object.freeze({
    totalSignals: signals.length,
    weightedScore,
    strongestSignals: sorted.slice(0, 5).map((signal) => signal.id),
    weakestSignals: sorted.slice(-5).map((signal) => signal.id),
    missingTelemetry: [...missingTelemetry],
    metadata: { totalWeight },
  });
}
