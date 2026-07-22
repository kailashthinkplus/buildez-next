import type { LearningInput, SimilarityLearningSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

export function extractSimilarityLearningSignals(input: LearningInput): SimilarityLearningSignal[] {
  if (!input.similarityResult) return [];
  return [
    createRankingSignal({ id: `similarity.signal.${input.similarityResult.id}.diversity`, kind: "similarity", targetId: input.similarityResult.id, score: input.similarityResult.overallDiversityScore.score / 100, weight: 1.1, reason: "Similarity diversity score.", metadata: { similarity: input.similarityResult.overallSimilarityScore } }) as SimilarityLearningSignal,
    ...input.similarityResult.dimensionScores.map((score) => createRankingSignal({ id: `similarity.signal.${score.dimension}.${score.targetId}`, kind: "similarity", targetId: score.dimension, score: 1 - score.score, weight: 0.7, reason: `Inverse similarity for ${score.dimension}.`, metadata: { targetId: score.targetId } }) as SimilarityLearningSignal),
  ];
}
