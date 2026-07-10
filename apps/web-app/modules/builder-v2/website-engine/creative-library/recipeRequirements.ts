import type { CreativeRecipe } from "./creativeRecipe";

export function collectRecipeRequirements(recipes: readonly CreativeRecipe[]) {
  return Object.freeze({
    requiredContentFields: Array.from(new Set(recipes.flatMap((recipe) => recipe.requirements.requiredContentFields))),
    optionalContentFields: Array.from(new Set(recipes.flatMap((recipe) => recipe.requirements.optionalContentFields))),
    requiredAssets: Array.from(new Set(recipes.flatMap((recipe) => recipe.requirements.requiredAssets))),
  });
}
