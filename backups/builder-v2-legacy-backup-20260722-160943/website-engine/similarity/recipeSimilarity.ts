import { dimensionScore, jaccard } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Compares selected recipe ids.
 *
 * @example
 * const score = compareRecipeSelections(profile, target);
 */
export function compareRecipeSelections(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const overlap = jaccard(candidate.recipeIds, target.recipeIds);
  return dimensionScore("recipe-overlap", overlap, target.id, [`Recipe overlap: ${Math.round(overlap * 100)}%.`]);
}

/**
 * Compares Creative Library recipe family repetition.
 *
 * @example
 * const score = compareCreativeFamilies(profile, target);
 */
export function compareCreativeFamilies(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const overlap = jaccard(candidate.recipeFamilies, target.recipeFamilies);
  return dimensionScore("creative-family", overlap, target.id, [`Creative family overlap: ${Math.round(overlap * 100)}%.`]);
}
