import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates Design DNA consistency and uniqueness metadata.
 *
 * @example
 * const result = runDesignDnaCritic({ designDNA });
 */
export function runDesignDnaCritic(input: CriticInput): CriticCategoryResult {
  const dna = input.designDNA;
  const issues = [];
  const recommendations = [];

  if (!dna) {
    issues.push(metadataIssue("design-dna", "major", "Design DNA is missing.", "Run Design DNA before final critic evaluation."));
    recommendations.push(repairRecommendation("design-dna", "high", "Generate Design DNA metadata.", "Build axes for grid, rhythm, spacing, motion, and density."));
    return createCategoryResult("design-dna", 58, ["No Design DNA supplied."], issues, [], recommendations);
  }

  if (dna.uniquenessScore < 0.6) {
    issues.push(metadataIssue("design-dna", "major", "Design DNA uniqueness score is low.", "Increase fragment variety and adjust design axes."));
  }
  if (dna.traits.length < 10) {
    recommendations.push(repairRecommendation("design-dna", "medium", "Expand Design DNA traits.", "Carry more selected recipe and fragment traits into the DNA profile."));
  }

  return createCategoryResult("design-dna", 72 + dna.uniquenessScore * 22 + Math.min(dna.traits.length, 12) / 2, [
    `Design DNA uniqueness: ${dna.uniquenessScore}.`,
    `Design DNA trait count: ${dna.traits.length}.`,
  ], issues, [], recommendations);
}
