import type { CreativeRecipe, CreativeRecipeFallback } from "./creativeRecipe";

export function buildRecipeFallbacks(recipe: CreativeRecipe): CreativeRecipeFallback[] {
  return recipe.fallbacks.length ? recipe.fallbacks : [Object.freeze({ reason: "Default fallback.", fallbackBehavior: "Use simpler editable primitive recipe metadata." })];
}
