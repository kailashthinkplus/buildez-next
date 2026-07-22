import type { LearningInput, SelfPlayLearningSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractSelfPlayLearningSignals(input: LearningInput): SelfPlayLearningSignal[] {
  if (!input.selfPlayResult) return [];
  return [
    createRankingSignal({ id: `self-play.signal.${input.selfPlayResult.id}.best`, kind: "self-play", targetId: input.selfPlayResult.bestCandidate.id, score: input.selfPlayResult.bestCandidate.score.overallScore / 100, weight: 1.3, reason: "Self-play best candidate score.", metadata: { stoppingReason: input.selfPlayResult.stoppingReason } }) as SelfPlayLearningSignal,
    ...input.selfPlayResult.iterationHistory.map((iteration) => createRankingSignal({ id: `self-play.signal.iteration.${iteration.iteration}`, kind: "self-play", targetId: iteration.candidate.id, score: iteration.overallScore / 100, weight: 0.8, reason: `Self-play iteration ${iteration.iteration}.`, metadata: { improvement: iteration.improvement } }) as SelfPlayLearningSignal),
  ];
}
