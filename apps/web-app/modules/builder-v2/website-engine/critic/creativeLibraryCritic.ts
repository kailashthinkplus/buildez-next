import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

function dominantRecipeFamilyShare(input: CriticInput): number {
  const selections = input.creativeLibraryResult?.selections ?? [];
  if (selections.length === 0) return 0;
  const counts = selections.reduce<Record<string, number>>((accumulator, selection) => {
    accumulator[selection.recipe.family] = (accumulator[selection.recipe.family] ?? 0) + 1;
    return accumulator;
  }, {});
  return Math.max(...Object.values(counts)) / selections.length;
}

/**
 * Evaluates recipe diversity and fragment assembly metadata.
 *
 * @example
 * const result = runCreativeLibraryCritic({ creativeLibraryResult, recipeAssemblyResults });
 */
export function runCreativeLibraryCritic(input: CriticInput): CriticCategoryResult {
  const selectedCount = input.creativeLibraryResult?.selections.length ?? 0;
  const assemblyCount = input.recipeAssemblyResults?.length ?? 0;
  const duplicateShare = dominantRecipeFamilyShare(input);
  const diversityCoverage = input.creativeLibraryResult?.metrics.diversityCoverage ?? (duplicateShare ? 1 - duplicateShare : 0);
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (selectedCount === 0) {
    issues.push(metadataIssue("creative-library", "major", "No Creative Library recipe selections are available.", "Select metadata recipes before critic evaluation."));
  }
  if (duplicateShare >= 0.75 && selectedCount >= 4) {
    hardFailures.push(hardFailure("creative-library", "REPEATED_NEAR_IDENTICAL_RECIPE_USE", "Repeated near-identical recipe use where diversity is expected.", "Repair with different recipe families or fragment assemblies."));
  }
  if (assemblyCount === 0) {
    recommendations.push(repairRecommendation("creative-library", "medium", "Add fragment assembly metadata.", "Use recipe fragments so repair can vary layout, spacing, motion, and CTA treatments."));
  }

  return createCategoryResult("creative-library", 70 + selectedCount * 2 + assemblyCount * 2 + diversityCoverage * 18 - duplicateShare * 12, [
    `Creative recipe selections: ${selectedCount}.`,
    `Fragment assembly count: ${assemblyCount}.`,
    `Dominant recipe family share: ${duplicateShare.toFixed(2)}.`,
  ], issues, hardFailures, recommendations);
}
