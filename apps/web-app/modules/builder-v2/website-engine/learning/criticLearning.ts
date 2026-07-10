import type { CriticLearningSignal, LearningInput } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractCriticLearningSignals(input: LearningInput): CriticLearningSignal[] {
  if (!input.criticResult) return [];
  return [
    createRankingSignal({ id: `critic.signal.${input.criticResult.id}.overall`, kind: "critic", targetId: input.criticResult.id, score: input.criticResult.overallScore / 100, weight: 1.2, reason: "Critic overall score.", metadata: { hardFailures: input.criticResult.hardFailures.length } }) as CriticLearningSignal,
    ...input.criticResult.categoryScores.map((score) => createRankingSignal({ id: `critic.signal.${score.category}`, kind: "critic", targetId: score.category, score: score.score / 100, weight: score.weight, reason: `Critic category ${score.category}.`, metadata: { passed: score.passed } }) as CriticLearningSignal),
  ];
}
