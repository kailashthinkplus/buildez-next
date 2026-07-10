import type { PatternCandidate } from "./patternIntelligence";

/**
 * Ranks pattern candidates by deterministic score.
 *
 * @example
 * const ranked = rankPatternCandidates(candidates);
 */
export function rankPatternCandidates(candidates: readonly PatternCandidate[]): PatternCandidate[] {
  return [...candidates].sort((left, right) => {
    const scoreDelta = right.score.overall - left.score.overall;
    return scoreDelta !== 0 ? scoreDelta : left.definition.id.localeCompare(right.definition.id);
  });
}
