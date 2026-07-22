import { jaccard, orderedSimilarity, scoreOverallSimilarity, dimensionScore } from "../similarity";
import type { CandidateComparison, WebsiteCandidate } from "./candidateVariants";

/**
 * Compares generated candidates against each other for ranking stability.
 *
 * @example
 * const comparisons = compareCandidates(candidates);
 */
export function compareCandidates(candidates: readonly WebsiteCandidate[]): CandidateComparison[] {
  const comparisons: CandidateComparison[] = [];
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const left = candidates[leftIndex];
      const right = candidates[rightIndex];
      const leftProfile = left.profile.similarityProfile;
      const rightProfile = right.profile.similarityProfile;
      const scores = [
        dimensionScore("recipe-overlap", jaccard(leftProfile.recipeIds, rightProfile.recipeIds), right.id, []),
        dimensionScore("fragment-overlap", jaccard(leftProfile.fragmentFamilies, rightProfile.fragmentFamilies), right.id, []),
        dimensionScore("component-overlap", jaccard(leftProfile.componentFamilies, rightProfile.componentFamilies), right.id, []),
        dimensionScore("composition-order", orderedSimilarity(leftProfile.sectionSequence, rightProfile.sectionSequence), right.id, []),
        dimensionScore("layout-rhythm", jaccard(leftProfile.layoutRhythm, rightProfile.layoutRhythm), right.id, []),
        dimensionScore("motion-rhythm", jaccard(leftProfile.motionRhythm, rightProfile.motionRhythm), right.id, []),
        dimensionScore("typography-rhythm", jaccard(leftProfile.typographyRhythm, rightProfile.typographyRhythm), right.id, []),
        dimensionScore("cta-cadence", jaccard(leftProfile.ctaCadence, rightProfile.ctaCadence), right.id, []),
        dimensionScore("visual-density", jaccard(leftProfile.visualDensity, rightProfile.visualDensity), right.id, []),
        dimensionScore("creative-family", jaccard(leftProfile.recipeFamilies, rightProfile.recipeFamilies), right.id, []),
      ];
      const similarity = scoreOverallSimilarity(scores);
      comparisons.push(Object.freeze({
        leftCandidateId: left.id,
        rightCandidateId: right.id,
        similarity,
        sharedDimensions: scores.filter((score) => score.score > 0.5).map((score) => score.dimension),
      }));
    }
  }
  return comparisons;
}
