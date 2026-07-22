import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares layout rhythm metadata.
 *
 * @example
 * const score = compareLayoutRhythm(profile, target);
 */
export function compareLayoutRhythm(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = jaccard(candidate.layoutRhythm, target.layoutRhythm);
  return dimensionScore("layout-rhythm", score, target.id, [`Layout rhythm overlap: ${Math.round(score * 100)}%.`]);
}

/**
 * Compares visual density metadata.
 *
 * @example
 * const score = compareVisualDensity(profile, target);
 */
export function compareVisualDensity(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = jaccard(candidate.visualDensity, target.visualDensity);
  return dimensionScore("visual-density", score, target.id, [`Visual density overlap: ${Math.round(score * 100)}%.`]);
}
