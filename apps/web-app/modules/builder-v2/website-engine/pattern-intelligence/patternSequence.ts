import type { PatternCandidate, PatternSequence } from "./patternIntelligence";

const roleOrder = ["orientation", "trust-building", "exploration", "proof", "locality", "objection-handling", "conversion", "closure"];

/**
 * Builds a semantic sequence suggestion from ranked pattern candidates.
 *
 * @example
 * const sequence = buildPatternSequence(ranked);
 */
export function buildPatternSequence(rankedCandidates: readonly PatternCandidate[]): PatternSequence {
  const selected = rankedCandidates
    .filter((candidate) => candidate.score.overall >= 0.56)
    .sort((left, right) => roleOrder.indexOf(left.definition.role) - roleOrder.indexOf(right.definition.role))
    .slice(0, 9);
  return Object.freeze({
    patternIds: selected.map((candidate) => candidate.definition.id),
    rationale: selected.map((candidate) => `${candidate.definition.name} supports ${candidate.definition.role}.`),
  });
}
