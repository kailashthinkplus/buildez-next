import type { CandidateRanking, CandidateScore, WebsiteCandidate } from "./candidateVariants";

/**
 * Ranks candidates deterministically by weighted score and id.
 *
 * @example
 * const ranking = rankCandidates(candidates, scores);
 */
export function rankCandidates(candidates: readonly WebsiteCandidate[], scores: readonly CandidateScore[]): CandidateRanking[] {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  return [...scores]
    .sort((left, right) => right.overallScore - left.overallScore || right.similarityScore - left.similarityScore || left.candidateId.localeCompare(right.candidateId))
    .map((score, index) => Object.freeze({
      rank: index + 1,
      candidate: byId.get(score.candidateId) ?? candidates[0],
      score,
    }));
}
