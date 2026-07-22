import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares component ids and families.
 *
 * @example
 * const score = compareComponents(profile, target);
 */
export function compareComponents(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const idOverlap = jaccard(candidate.componentIds, target.componentIds);
  const familyOverlap = jaccard(candidate.componentFamilies, target.componentFamilies);
  return dimensionScore("component-overlap", Math.max(idOverlap, familyOverlap * 0.8), target.id, [
    `Component id overlap: ${Math.round(idOverlap * 100)}%.`,
    `Component family overlap: ${Math.round(familyOverlap * 100)}%.`,
  ]);
}
