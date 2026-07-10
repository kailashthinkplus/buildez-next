import type { CreativeLibraryInput, CreativeRecipe, CreativeRecipeCandidate, CreativeRecipeScore } from "./creativeRecipe";
import { detectRecipeCompatibility } from "./recipeCompatibility";

function scoreMatch(inputValues: readonly string[] | undefined, recipeValues: readonly string[]) {
  if (!inputValues?.length) return 0.7;
  const matches = inputValues.filter((value) => recipeValues.includes(value)).length;
  return Math.min(1, matches / Math.max(1, inputValues.length));
}

export function scoreCreativeRecipe(recipe: CreativeRecipe, input: CreativeLibraryInput = {}): CreativeRecipeScore {
  const familyFit = input.families?.length ? (input.families.includes(recipe.family) ? 1 : 0.25) : 0.75;
  const archetypeFit = scoreMatch(input.archetypes, recipe.compatibility.supportedArchetypes);
  const designFit = scoreMatch(input.designLanguages, recipe.compatibility.supportedDesignLanguages);
  const industryFit = scoreMatch(input.industries, recipe.compatibility.supportedIndustries);
  const motionFit = scoreMatch(input.motionStrategies, recipe.compatibility.suitableMotionStrategies);
  const overall = Number(((familyFit + archetypeFit + designFit + industryFit + motionFit) / 5).toFixed(3));
  return Object.freeze({ familyFit, archetypeFit, designFit, industryFit, motionFit, overall });
}

export function buildCreativeRecipeCandidates(recipes: readonly CreativeRecipe[], input: CreativeLibraryInput = {}): CreativeRecipeCandidate[] {
  return recipes
    .filter((recipe) => detectRecipeCompatibility(recipe, input).compatible)
    .map((recipe) => Object.freeze({ recipe, score: scoreCreativeRecipe(recipe, input), reasons: [`Matched ${recipe.family} ${recipe.variant}.`], risks: recipe.antiPatterns }));
}

export const scoreCreativeRecipes = buildCreativeRecipeCandidates;
