import type { LearningInput, PatternLearningSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractPatternLearningSignals(input: LearningInput): PatternLearningSignal[] {
  const patterns = [
    ...(input.compiledPlan?.sections.map((section) => section.patternId) ?? []),
    ...(input.compositionResult?.orderedSectionSequence.map((section) => section.category) ?? []),
  ].filter(Boolean);
  return [...new Set(patterns)].map((patternId) => createRankingSignal({
    id: `pattern.signal.${patternId}`,
    kind: "pattern",
    targetId: String(patternId),
    score: 0.72,
    weight: 0.8,
    reason: "Pattern participated in compiled or composed metadata.",
    metadata: {},
  }) as PatternLearningSignal);
}
