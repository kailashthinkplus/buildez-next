import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares motion rhythm metadata.
 *
 * @example
 * const score = compareMotionRhythm(profile, target);
 */
export function compareMotionRhythm(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = jaccard(candidate.motionRhythm, target.motionRhythm);
  return dimensionScore("motion-rhythm", score, target.id, [`Motion rhythm overlap: ${Math.round(score * 100)}%.`]);
}
