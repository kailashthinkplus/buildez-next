import type { CreativeRecipe, CreativeRecipeCandidate, CreativeRecipeSelection } from "./creativeRecipe";
import { buildRecipeFallbacks } from "./recipeFallbacks";
import { rankCreativeRecipes } from "./recipeRanking";

export type CreativeRecipeDiversityProfile = Readonly<{
  family: string;
  variant: string;
  layoutPattern: string;
  visualHierarchy: string;
  whitespaceLevel: string;
  mediaRatio: string;
  motionSuitability: string;
  designLanguages: string[];
  industries: string[];
}>;

function profile(recipe: CreativeRecipe): CreativeRecipeDiversityProfile {
  return Object.freeze({
    family: recipe.family,
    variant: recipe.variant,
    layoutPattern: recipe.metadata.layoutPattern,
    visualHierarchy: recipe.metadata.visualHierarchy,
    whitespaceLevel: recipe.metadata.whitespaceLevel,
    mediaRatio: recipe.metadata.mediaRatio,
    motionSuitability: recipe.metadata.motionSuitability,
    designLanguages: recipe.compatibility.supportedDesignLanguages,
    industries: recipe.compatibility.supportedIndustries,
  });
}

/**
 * Calculates deterministic diversity score against already selected recipes.
 *
 * @example
 * const score = calculateRecipeDiversityScore(recipe, selected);
 */
export function calculateRecipeDiversityScore(recipe: CreativeRecipe, selected: readonly CreativeRecipe[] = []): number {
  if (!selected.length) return 1;
  const next = profile(recipe);
  const penalties = selected.map((item) => {
    const current = profile(item);
    return [
      current.family === next.family ? 0.18 : 0,
      current.variant === next.variant ? 0.2 : 0,
      current.layoutPattern === next.layoutPattern ? 0.16 : 0,
      current.visualHierarchy === next.visualHierarchy ? 0.12 : 0,
      current.whitespaceLevel === next.whitespaceLevel ? 0.1 : 0,
      current.mediaRatio === next.mediaRatio ? 0.12 : 0,
      current.motionSuitability === next.motionSuitability ? 0.08 : 0,
      current.industries.some((industry) => next.industries.includes(industry)) ? 0.04 : 0,
    ].reduce((total, value) => total + value, 0);
  });
  const highestPenalty = Math.max(0, ...penalties);
  return Number(Math.max(0, 1 - highestPenalty).toFixed(3));
}

/**
 * Groups recipes by family.
 *
 * @example
 * const grouped = groupRecipesByFamily(catalog);
 */
export function groupRecipesByFamily(recipes: readonly CreativeRecipe[]): Record<string, CreativeRecipe[]> {
  return recipes.reduce<Record<string, CreativeRecipe[]>>((groups, recipe) => {
    groups[recipe.family] = [...(groups[recipe.family] ?? []), recipe];
    return groups;
  }, {});
}

/**
 * Removes near-duplicate candidates using family, variant, and layout pattern.
 *
 * @example
 * const candidates = avoidNearDuplicateRecipes(allCandidates);
 */
export function avoidNearDuplicateRecipes(candidates: readonly CreativeRecipeCandidate[]): CreativeRecipeCandidate[] {
  const seen = new Set<string>();
  const result: CreativeRecipeCandidate[] = [];
  for (const candidate of rankCreativeRecipes(candidates)) {
    const key = [candidate.recipe.family, candidate.recipe.variant, candidate.recipe.metadata.layoutPattern, candidate.recipe.metadata.mediaRatio].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

/**
 * Selects recipes while preserving deterministic diversity across family, layout, hierarchy, whitespace, media, design, and industry metadata.
 *
 * @example
 * const selections = selectDiverseCreativeRecipes(candidates, 24);
 */
export function selectDiverseCreativeRecipes(candidates: readonly CreativeRecipeCandidate[], limit = 24): CreativeRecipeSelection[] {
  const remaining = avoidNearDuplicateRecipes(candidates);
  const selected: CreativeRecipeCandidate[] = [];
  while (selected.length < limit && remaining.length) {
    remaining.sort((a, b) => {
      const aDiversity = calculateRecipeDiversityScore(a.recipe, selected.map((item) => item.recipe));
      const bDiversity = calculateRecipeDiversityScore(b.recipe, selected.map((item) => item.recipe));
      const aScore = a.score.overall * 0.72 + aDiversity * 0.28;
      const bScore = b.score.overall * 0.72 + bDiversity * 0.28;
      return bScore - aScore || a.recipe.id.localeCompare(b.recipe.id);
    });
    const next = remaining.shift();
    if (next) selected.push(next);
  }
  return selected.map((candidate) => Object.freeze({
    recipe: candidate.recipe,
    rationale: [...candidate.reasons, `Diversity score ${calculateRecipeDiversityScore(candidate.recipe, selected.map((item) => item.recipe))}.`],
    fallbacks: buildRecipeFallbacks(candidate.recipe),
  }));
}

/**
 * Calculates coverage ratio across diverse recipe metadata dimensions.
 *
 * @example
 * const coverage = calculateRecipeDiversityCoverage(catalog);
 */
export function calculateRecipeDiversityCoverage(recipes: readonly CreativeRecipe[]): number {
  if (!recipes.length) return 0;
  const dimensions = [
    new Set(recipes.map((recipe) => recipe.family)).size,
    new Set(recipes.map((recipe) => recipe.variant)).size,
    new Set(recipes.map((recipe) => recipe.metadata.layoutPattern)).size,
    new Set(recipes.map((recipe) => recipe.metadata.visualHierarchy)).size,
    new Set(recipes.map((recipe) => recipe.metadata.mediaRatio)).size,
  ];
  return Number(Math.min(1, dimensions.reduce((total, value) => total + value, 0) / Math.max(1, recipes.length * 0.25)).toFixed(3));
}
