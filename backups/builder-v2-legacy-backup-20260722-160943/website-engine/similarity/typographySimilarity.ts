import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares typography rhythm metadata.
 *
 * @example
 * const score = compareTypographyRhythm(profile, target);
 */
export function compareTypographyRhythm(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = jaccard(candidate.typographyRhythm, target.typographyRhythm);
  return dimensionScore("typography-rhythm", score, target.id, [`Typography rhythm overlap: ${Math.round(score * 100)}%.`]);
}
