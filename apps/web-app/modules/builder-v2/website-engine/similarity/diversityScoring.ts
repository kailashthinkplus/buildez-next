import type { SimilarityDimension, SimilarityScore, DiversityPenalty, DiversityScore } from "./similarityResult";

/**
 * Normalizes a similarity value to 0-1.
 *
 * @example
 * const score = normalizeSimilarity(1.4);
 */
export function normalizeSimilarity(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

/**
 * Normalizes a diversity value to 0-100.
 *
 * @example
 * const score = normalizeDiversityScore(104);
 */
export function normalizeDiversityScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Computes Jaccard similarity between two string sets.
 *
 * @example
 * const overlap = jaccard(["a"], ["a", "b"]);
 */
export function jaccard(left: readonly string[], right: readonly string[]): number {
  const leftSet = new Set(left.filter(Boolean));
  const rightSet = new Set(right.filter(Boolean));
  if (!leftSet.size && !rightSet.size) return 0;
  const intersection = [...leftSet].filter((value) => rightSet.has(value)).length;
  const union = new Set([...leftSet, ...rightSet]).size || 1;
  return normalizeSimilarity(intersection / union);
}

/**
 * Computes ordered sequence similarity by matching items at the same position.
 *
 * @example
 * const similarity = orderedSimilarity(["hero", "cta"], ["hero", "proof"]);
 */
export function orderedSimilarity(left: readonly string[], right: readonly string[]): number {
  const length = Math.max(left.length, right.length);
  if (!length) return 0;
  let matches = 0;
  for (let index = 0; index < length; index += 1) {
    if (left[index] && left[index] === right[index]) matches += 1;
  }
  return normalizeSimilarity(matches / length);
}

/**
 * Scores the highest overall similarity from all dimensions.
 *
 * @example
 * const overall = scoreOverallSimilarity(scores);
 */
export function scoreOverallSimilarity(scores: readonly SimilarityScore[]): number {
  if (!scores.length) return 0;
  const weights: Record<SimilarityDimension, number> = {
    "design-dna": 1.2,
    "recipe-overlap": 1.2,
    "fragment-overlap": 1,
    "component-overlap": 1,
    "composition-order": 1.15,
    "layout-rhythm": 0.9,
    "motion-rhythm": 0.8,
    "typography-rhythm": 0.8,
    "cta-cadence": 0.9,
    "visual-density": 0.75,
    "industry-archetype": 0.7,
    "creative-family": 1,
  };
  const totalWeight = scores.reduce((sum, score) => sum + weights[score.dimension], 0) || 1;
  return normalizeSimilarity(scores.reduce((sum, score) => sum + score.score * weights[score.dimension], 0) / totalWeight);
}

/**
 * Scores diversity inversely from similarity and penalties.
 *
 * @example
 * const diversity = scoreDiversity(0.42, []);
 */
export function scoreDiversity(overallSimilarity: number, penalties: readonly DiversityPenalty[]): DiversityScore {
  const penaltyAmount = penalties.reduce((sum, penalty) => sum + penalty.amount, 0);
  const score = normalizeDiversityScore((1 - overallSimilarity) * 100 - penaltyAmount);
  return Object.freeze({
    score,
    grade: score >= 90 ? "excellent" : score >= 75 ? "acceptable" : score >= 60 ? "weak" : "fail",
    reasons: [
      `Overall similarity: ${overallSimilarity.toFixed(2)}.`,
      `Penalty amount: ${penaltyAmount}.`,
    ],
  });
}

/**
 * Builds a dimension score object.
 *
 * @example
 * const score = dimensionScore("recipe-overlap", 0.5, "previous", ["2 recipes overlap"]);
 */
export function dimensionScore(dimension: SimilarityDimension, score: number, targetId: string, reasons: string[]): SimilarityScore {
  return Object.freeze({ dimension, score: normalizeSimilarity(score), targetId, reasons });
}
