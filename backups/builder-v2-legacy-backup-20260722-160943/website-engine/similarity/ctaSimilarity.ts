import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares CTA cadence metadata.
 *
 * @example
 * const score = compareCTACadence(profile, target);
 */
export function compareCTACadence(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const score = jaccard(candidate.ctaCadence, target.ctaCadence);
  return dimensionScore("cta-cadence", score, target.id, [`CTA cadence overlap: ${Math.round(score * 100)}%.`]);
}
