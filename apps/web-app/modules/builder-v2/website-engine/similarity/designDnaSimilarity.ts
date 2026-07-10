import { DESIGN_DNA_AXES, type DesignDNA } from "../creative-library/dna";
import { dimensionScore, normalizeSimilarity } from "./diversityScoring";
import type { SimilarityScore, WebsiteSimilarityProfile } from "./similarityResult";

/**
 * Extracts comparable Design DNA axes.
 *
 * @example
 * const axes = designDnaAxes(designDNA);
 */
export function designDnaAxes(designDNA?: DesignDNA): Record<string, string> {
  if (!designDNA) return {};
  return DESIGN_DNA_AXES.reduce<Record<string, string>>((accumulator, axis) => {
    accumulator[axis] = String(designDNA[axis] ?? "");
    return accumulator;
  }, {});
}

/**
 * Compares candidate and target Design DNA axes.
 *
 * @example
 * const score = compareDesignDNA(profile, target);
 */
export function compareDesignDNA(candidate: WebsiteSimilarityProfile, target: WebsiteSimilarityProfile): SimilarityScore {
  const keys = new Set([...Object.keys(candidate.designDnaAxes), ...Object.keys(target.designDnaAxes)]);
  if (!keys.size) return dimensionScore("design-dna", 0, target.id, ["No Design DNA axes available for comparison."]);
  const matches = [...keys].filter((key) => candidate.designDnaAxes[key] && candidate.designDnaAxes[key] === target.designDnaAxes[key]).length;
  const sameId = candidate.designDnaId && candidate.designDnaId === target.designDnaId ? 0.25 : 0;
  return dimensionScore("design-dna", normalizeSimilarity(matches / keys.size + sameId), target.id, [`Design DNA axis matches: ${matches}/${keys.size}.`]);
}
