import type { ReasoningCandidate, ReasoningInput } from "./reasoning";
import { explainCandidate } from "./explanations";
import { scoreCandidates } from "./scoring";

/**
 * Ranks candidates deterministically by overall score, confidence, category, and id.
 *
 * @example
 * const ranked = rankCandidates(candidates, input);
 */
export function rankCandidates(candidates: readonly ReasoningCandidate[], input: ReasoningInput): ReasoningCandidate[] {
  return scoreCandidates(candidates, input)
    .map((candidate) => {
      const withExplanation = { ...candidate };
      return Object.freeze({ ...withExplanation, explanation: explainCandidate(withExplanation, input) });
    })
    .sort((left, right) =>
      right.score.overallScore - left.score.overallScore ||
      right.score.confidence - left.score.confidence ||
      left.category.localeCompare(right.category) ||
      String(left.id).localeCompare(String(right.id))
    );
}
