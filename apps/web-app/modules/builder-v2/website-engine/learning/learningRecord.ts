import type { LearningRecord, RankingSignal } from "./learningResult";

export function buildLearningRecords(signals: readonly RankingSignal[]): LearningRecord[] {
  const byKind = signals.reduce<Record<string, string[]>>((accumulator, signal) => {
    accumulator[signal.kind] = [...(accumulator[signal.kind] ?? []), signal.id];
    return accumulator;
  }, {});
  const createdAt = new Date().toISOString();
  return Object.entries(byKind).map(([kind, signalIds]) => Object.freeze({
    id: `learning.record.${kind}`,
    source: kind as LearningRecord["source"],
    signalIds,
    createdAt,
    persisted: false as const,
    metadata: { signalCount: signalIds.length },
  }));
}
