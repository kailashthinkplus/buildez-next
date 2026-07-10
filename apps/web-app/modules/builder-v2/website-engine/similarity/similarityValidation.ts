import type { EngineResult } from "../sdk";
import type { SimilarityInput } from "./similarityInput";
import type { SimilarityDimension, SimilarityResult } from "./similarityResult";

const REQUIRED_DIMENSIONS: SimilarityDimension[] = [
  "design-dna",
  "recipe-overlap",
  "fragment-overlap",
  "component-overlap",
  "composition-order",
  "layout-rhythm",
  "motion-rhythm",
  "typography-rhythm",
  "cta-cadence",
  "visual-density",
  "industry-archetype",
  "creative-family",
];

/**
 * Validates Similarity Engine input while allowing missing history.
 *
 * @example
 * const validation = validateSimilarityInput({ creativeLibraryResult });
 */
export function validateSimilarityInput(input: SimilarityInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.designDNA && !input.creativeLibraryResult && !input.compiledPlan && !input.componentResult && !input.compositionResult) {
    issues.push("Similarity input has sparse candidate metadata; internal baseline rules will be used.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Similarity Engine should remain inert with feature flags false.");
  }
  return Object.freeze({ valid: true, issues });
}

/**
 * Validates Similarity Engine result shape.
 *
 * @example
 * const validation = validateSimilarityResult(result);
 */
export function validateSimilarityResult(result: SimilarityResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Similarity result requires an id.");
  if (!result.version) issues.push("Similarity result requires a version.");
  if (result.overallSimilarityScore < 0 || result.overallSimilarityScore > 1) issues.push("Similarity score must be normalized to 0-1.");
  if (result.overallDiversityScore.score < 0 || result.overallDiversityScore.score > 100) issues.push("Diversity score must be normalized to 0-100.");
  const dimensions = new Set(result.dimensionScores.map((score) => score.dimension));
  for (const dimension of REQUIRED_DIMENSIONS) {
    if (!dimensions.has(dimension)) issues.push(`Missing similarity dimension: ${dimension}.`);
  }
  if (result.overallSimilarityScore >= 0.71 && !result.diversityRecommendations.length) issues.push("High similarity requires diversity recommendations.");
  if (result.overallSimilarityScore >= 0.85 && !result.repairHints.length) issues.push("Failed similarity requires repair hints.");
  if (!result.trace.includes("similarity.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.persisted || result.rendered || result.screenshotCaptured || result.sideEffects) issues.push("Similarity result must remain inert and metadata-only.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates the EngineResult wrapper returned by Similarity Engine.
 *
 * @example
 * const validation = validateSimilarityEngineResult(result);
 */
export function validateSimilarityEngineResult(result: EngineResult<SimilarityResult>): { valid: boolean; issues: string[] } {
  const validation = validateSimilarityResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "similarity") issues.push("EngineResult trace module must be similarity.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
