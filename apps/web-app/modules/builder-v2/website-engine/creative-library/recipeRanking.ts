import type { CreativeRecipeCandidate, CreativeRecipeSelection } from "./creativeRecipe";
import { buildRecipeFallbacks } from "./recipeFallbacks";

export function rankCreativeRecipes(candidates: readonly CreativeRecipeCandidate[]): CreativeRecipeCandidate[] {
  return [...candidates].sort((a, b) => b.score.overall - a.score.overall || a.recipe.id.localeCompare(b.recipe.id));
}

export function selectCreativeRecipes(candidates: readonly CreativeRecipeCandidate[], limit = 24): CreativeRecipeSelection[] {
  return rankCreativeRecipes(candidates).slice(0, limit).map((candidate) => Object.freeze({
    recipe: candidate.recipe,
    rationale: candidate.reasons,
    fallbacks: buildRecipeFallbacks(candidate.recipe),
  }));
}
