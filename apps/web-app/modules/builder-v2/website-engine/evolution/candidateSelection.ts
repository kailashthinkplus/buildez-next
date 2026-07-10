import type { CandidateRanking, CandidateWinner } from "./candidateVariants";

/**
 * Selects the winning candidate from deterministic ranking.
 *
 * @example
 * const winner = selectWinningCandidate(ranking);
 */
export function selectWinningCandidate(ranking: readonly CandidateRanking[]): CandidateWinner {
  const selected = ranking[0];
  return Object.freeze({
    candidate: selected.candidate,
    score: selected.score,
    selectionReason: `Selected ${selected.candidate.profile.label} because it maximizes quality, uniqueness, accessibility, performance, editability, industry fit, truth, and motion safety.`,
  });
}

/**
 * Builds runner-up candidates while preserving rank order.
 *
 * @example
 * const runnerUps = buildRunnerUps(ranking);
 */
export function buildRunnerUps(ranking: readonly CandidateRanking[]): CandidateRanking[] {
  return ranking.slice(1, 5);
}

/**
 * Builds repair priority from the winning score profile.
 *
 * @example
 * const priorities = buildRepairPriority(winner);
 */
export function buildRepairPriority(winner: CandidateWinner): string[] {
  const entries = [
    ["content truth", winner.score.contentTruth],
    ["accessibility", winner.score.accessibility],
    ["performance", winner.score.performance],
    ["editability", winner.score.editability],
    ["industry fit", winner.score.industryFit],
    ["motion safety", winner.score.motionSafety],
    ["creative diversity", winner.score.creativeDiversity],
  ] as const;
  return entries
    .filter(([, score]) => score < 90)
    .sort((left, right) => left[1] - right[1])
    .map(([label, score]) => `Repair ${label} first; current score ${score}.`);
}
