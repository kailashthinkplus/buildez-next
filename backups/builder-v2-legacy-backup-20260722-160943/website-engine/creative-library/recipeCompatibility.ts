import type { CreativeLibraryInput, CreativeRecipe, CreativeRecipeConflict } from "./creativeRecipe";

function overlaps(left: readonly string[] = [], right: readonly string[] = []) {
  return !left.length || !right.length || left.some((value) => right.includes(value));
}

export function detectRecipeCompatibility(recipe: CreativeRecipe, input: CreativeLibraryInput = {}) {
  return Object.freeze({
    compatible:
      (!input.families?.length || input.families.includes(recipe.family)) &&
      overlaps(input.archetypes, recipe.compatibility.supportedArchetypes) &&
      overlaps(input.designLanguages, recipe.compatibility.supportedDesignLanguages) &&
      overlaps(input.industries, recipe.compatibility.supportedIndustries) &&
      overlaps(input.visualMoods, recipe.compatibility.suitableVisualMoods) &&
      overlaps(input.motionStrategies, recipe.compatibility.suitableMotionStrategies) &&
      overlaps(input.requiredPatterns, recipe.compatibility.supportedPatterns),
    reasons: [
      `family=${recipe.family}`,
      `archetypes=${recipe.compatibility.supportedArchetypes.length}`,
      `industries=${recipe.compatibility.supportedIndustries.length}`,
    ],
  });
}

export function detectRecipeConflicts(recipes: readonly CreativeRecipe[]): CreativeRecipeConflict[] {
  return recipes.flatMap((recipe) => recipe.conflicts);
}
