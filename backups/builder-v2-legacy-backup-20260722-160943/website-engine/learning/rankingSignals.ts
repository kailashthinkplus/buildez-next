import type { LearningInput, RankingSignal } from "./learningResult";
import { createRankingSignal } from "./learningResult";

/**
 * Extracts generic future-ranking signals from current metadata.
 *
 * @example
 * const signals = extractRankingSignals(input);
 */
export function extractRankingSignals(input: LearningInput): RankingSignal[] {
  return [
    ...(input.evolutionResult ? [createRankingSignal({ id: "ranking.evolution.winner", kind: "ranking", targetId: input.evolutionResult.winner.candidate.id, score: input.evolutionResult.winner.score.overallScore / 100, weight: 1.2, reason: "Evolution winner score.", metadata: { rank: 1 } })] : []),
    ...(input.selfPlayResult ? [createRankingSignal({ id: "ranking.self-play.best", kind: "ranking", targetId: input.selfPlayResult.bestCandidate.id, score: input.selfPlayResult.bestCandidate.score.overallScore / 100, weight: 1.3, reason: "Self-play best candidate score.", metadata: { stoppingReason: input.selfPlayResult.stoppingReason } })] : []),
    ...(input.criticResult ? [createRankingSignal({ id: "ranking.critic.overall", kind: "ranking", targetId: input.criticResult.id, score: input.criticResult.overallScore / 100, weight: 1, reason: "Critic overall score.", metadata: { publishRecommendation: input.criticResult.publishRecommendation } })] : []),
  ];
}
