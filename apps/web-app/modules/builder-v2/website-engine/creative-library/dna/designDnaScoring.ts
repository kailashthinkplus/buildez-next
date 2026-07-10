import type { DesignDNA, DesignDnaInput, DesignDnaScore } from "./designDna";

function uniqueCount(values: readonly string[]) {
  return new Set(values.filter(Boolean)).size;
}

/**
 * Scores Design DNA uniqueness deterministically.
 *
 * @example
 * const score = scoreDesignDNA(dna, input);
 */
export function scoreDesignDNA(dna: DesignDNA, input: DesignDnaInput = {}): DesignDnaScore {
  const recipeValues = input.selectedRecipes?.flatMap((recipe) => [
    recipe.family,
    recipe.variant,
    recipe.metadata.layoutPattern,
    recipe.metadata.mediaRatio,
    recipe.metadata.visualHierarchy,
  ]) ?? [];
  const traitDiversity = uniqueCount(dna.traits.map((trait) => `${trait.axis}:${trait.value}`)) / Math.max(1, dna.traits.length);
  const recipeDiversity = uniqueCount(recipeValues) / Math.max(1, recipeValues.length);
  const uniquenessScore = Number(Math.min(1, dna.uniquenessScore).toFixed(3));
  const diversityScore = Number(((traitDiversity * 0.6) + (recipeDiversity * 0.4)).toFixed(3));
  return Object.freeze({
    uniquenessScore,
    diversityScore,
    confidence: Number(((uniquenessScore + diversityScore) / 2).toFixed(3)),
    reasons: [
      `Traits considered: ${dna.traits.length}.`,
      `Recipe diversity considered: ${input.selectedRecipes?.length ?? 0}.`,
      `Deterministic seed: ${dna.diversitySeed}.`,
    ],
  });
}
