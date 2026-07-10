import type { CreativeRecipe } from "./creativeRecipe";

export function listRecipeVariants(recipes: readonly CreativeRecipe[]): string[] {
  return Array.from(new Set(recipes.map((recipe) => recipe.variant)));
}
