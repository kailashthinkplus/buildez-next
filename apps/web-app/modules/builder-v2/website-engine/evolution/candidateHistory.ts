import type { EvolutionInput, CandidateHistory } from "./candidateVariants";

/**
 * Builds input-only candidate history without persistence.
 *
 * @example
 * const history = buildCandidateHistory(input);
 */
export function buildCandidateHistory(input: EvolutionInput): CandidateHistory {
  const previousProfile = input.similarityResult?.profile ? [input.similarityResult.profile] : [];
  return Object.freeze({
    previousWinnerIds: [],
    previousProfiles: previousProfile,
  });
}
