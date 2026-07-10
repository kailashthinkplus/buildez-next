import { dimensionScore, orderedSimilarity } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares section order and composition sequence.
 *
 * @example
 * const score = compareComposition(profile, target);
 */
export function compareComposition(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = orderedSimilarity(candidate.sectionSequence, target.sectionSequence);
  return dimensionScore("composition-order", score, target.id, [`Same-position section matches: ${Math.round(score * 100)}%.`]);
}
