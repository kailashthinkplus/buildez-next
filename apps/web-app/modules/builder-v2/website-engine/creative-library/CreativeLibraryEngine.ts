import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import type { CreativeLibraryInput, CreativeLibraryResult, CreativeLibraryWarning, CreativeRecipe } from "./creativeRecipe";
import { buildCreativeRecipeCatalog } from "./recipeCatalog";
import { detectRecipeConflicts } from "./recipeCompatibility";
import { calculateRecipeDiversityCoverage, selectDiverseCreativeRecipes } from "./recipeDiversity";
import { buildCreativeRecipeCandidates } from "./recipeScoring";
import { selectCreativeRecipes } from "./recipeRanking";
import { validateCreativeLibraryResult } from "./validation";
import { generateDesignDNA, type DesignDnaInput, type DesignDnaResult } from "./dna";
import { assembleRecipeFromFragments, buildFragmentCatalog, type FragmentInput, type RecipeAssemblyResult } from "./fragments";

function collectMetrics(result: Omit<CreativeLibraryResult, "metrics">) {
  return Object.freeze({
    catalogCount: result.catalog.length,
    candidateCount: result.candidates.length,
    selectedCount: result.selections.length,
    warningCount: result.warnings.length,
    conflictCount: result.conflicts.length,
    fallbackCount: result.fallbacks.length,
    diversityCoverage: calculateRecipeDiversityCoverage(result.catalog),
    duplicateCount: result.catalog.length - new Set(result.catalog.map((recipe) => recipe.id)).size,
    missingMetadataCount: result.catalog.filter((recipe) => !recipe.metadata.layoutPattern || !recipe.fragments.layoutFragments.length).length,
  });
}

/**
 * Runs the metadata-only Creative Library.
 *
 * @example
 * const result = runCreativeLibrary({ families: ["hero"] });
 */
export function runCreativeLibrary(input: CreativeLibraryInput = {}): EngineResult<CreativeLibraryResult> {
  const catalog = buildCreativeRecipeCatalog();
  const candidates = buildCreativeRecipeCandidates(catalog, input);
  const selections = input.diversity === false ? selectCreativeRecipes(candidates, input.limit ?? 32) : selectDiverseCreativeRecipes(candidates, input.limit ?? 32);
  const conflicts = detectRecipeConflicts(selections.map((selection) => selection.recipe));
  const fallbacks = selections.flatMap((selection) => selection.fallbacks);
  const warnings: CreativeLibraryWarning[] = [];
  const partial = Object.freeze({
    catalog,
    candidates,
    selections,
    conflicts,
    fallbacks,
    warnings,
    trace: ["creative-library.local-only", "metadata-only", "no-builder-nodes", "no-react-css-html-js", "no-provider-db-network-llm-mcp"],
  });
  const result: CreativeLibraryResult = Object.freeze({ ...partial, metrics: collectMetrics(partial) });
  const validation = validateCreativeLibraryResult(result);
  const validationWarnings = validation.issues.map((message) => createEngineWarning("CREATIVE_LIBRARY_VALIDATION", message, "creative-library", "major"));
  const finalResult = validationWarnings.length
    ? Object.freeze({ ...result, warnings: validationWarnings, metrics: Object.freeze({ ...result.metrics, warningCount: validationWarnings.length }) })
    : result;
  return createEngineResult({
    module: "creative-library",
    stage: "recipe-selection",
    status: validation.valid ? "ok" : "warning",
    warnings: finalResult.warnings,
    data: finalResult,
    metadata: { localOnly: true, catalogCount: catalog.length, selectedCount: selections.length, metadataOnly: true },
  });
}

export type CreativeLibraryWithFragmentsResult = CreativeLibraryResult & Readonly<{
  designDna: DesignDnaResult;
  fragmentAssemblies: RecipeAssemblyResult[];
}>;

/**
 * Builds deterministic Design DNA for selected recipes.
 *
 * @example
 * const dna = buildDesignDNA({ selectedRecipes });
 */
export function buildDesignDNA(input: DesignDnaInput = {}): DesignDnaResult {
  return generateDesignDNA(input);
}

/**
 * Assembles one base recipe with compatible metadata-only fragments.
 *
 * @example
 * const assembly = assembleCreativeRecipe({ baseRecipe, designDna });
 */
export function assembleCreativeRecipe(input: FragmentInput & { baseRecipe: CreativeRecipe }): RecipeAssemblyResult {
  return assembleRecipeFromFragments(input);
}

/**
 * Runs Creative Library with deterministic Design DNA and fragment assembly metadata.
 *
 * @example
 * const result = runCreativeLibraryWithFragments({ limit: 8 });
 */
export function runCreativeLibraryWithFragments(input: CreativeLibraryInput = {}): EngineResult<CreativeLibraryWithFragmentsResult> {
  const baseResult = runCreativeLibrary(input).data;
  const selectedRecipes = baseResult.selections.map((selection) => selection.recipe);
  const designDna = buildDesignDNA({ creativeInput: input, selectedRecipes, industry: input.industries?.[0] });
  const fragmentAssemblies = selectedRecipes.slice(0, Math.min(8, selectedRecipes.length)).map((recipe) =>
    assembleRecipeFromFragments({ baseRecipe: recipe, designDna: designDna.designDna, industries: input.industries, designLanguages: input.designLanguages, limit: 12 })
  );
  const result: CreativeLibraryWithFragmentsResult = Object.freeze({
    ...baseResult,
    designDna,
    fragmentAssemblies,
    trace: [...baseResult.trace, "design-dna-generated", "recipe-fragments-assembled", "metadata-only"],
  });
  return createEngineResult({
    module: "creative-library",
    stage: "recipe-selection-with-fragments",
    status: baseResult.warnings.length ? "warning" : "ok",
    warnings: baseResult.warnings,
    data: result,
    metadata: {
      localOnly: true,
      metadataOnly: true,
      catalogCount: baseResult.metrics.catalogCount,
      fragmentCatalogCount: buildFragmentCatalog().length,
      assemblyCount: fragmentAssemblies.length,
      designDnaId: designDna.designDna.id,
    },
  });
}

export { buildCreativeRecipeCatalog, buildCreativeRecipeCandidates, selectCreativeRecipes, selectDiverseCreativeRecipes, detectRecipeConflicts, validateCreativeLibraryResult, buildFragmentCatalog };
