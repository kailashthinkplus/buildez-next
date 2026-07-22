import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares selected fragment ids and fragment families.
 *
 * @example
 * const score = compareFragmentSelections(profile, target);
 */
export function compareFragmentSelections(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const idOverlap = jaccard(candidate.fragmentIds, target.fragmentIds);
  const familyOverlap = jaccard(candidate.fragmentFamilies, target.fragmentFamilies);
  return dimensionScore("fragment-overlap", Math.max(idOverlap, familyOverlap * 0.85), target.id, [
    `Fragment id overlap: ${Math.round(idOverlap * 100)}%.`,
    `Fragment family overlap: ${Math.round(familyOverlap * 100)}%.`,
  ]);
}
