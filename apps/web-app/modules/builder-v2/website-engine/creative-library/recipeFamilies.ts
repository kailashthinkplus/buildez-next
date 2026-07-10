import type { CreativeRecipe, CreativeRecipeFamily } from "./creativeRecipe";

export function listRecipeFamilies(recipes: readonly CreativeRecipe[]): CreativeRecipeFamily[] {
  return Array.from(new Set(recipes.map((recipe) => recipe.family)));
}
