import { createEngineResult, createEngineWarning, type EngineResult } from "../../sdk";
import { buildCreativeRecipeCatalog } from "../recipeCatalog";
import { generateDesignDNA } from "../dna";
import { assembleRecipeFromFragments } from "./fragmentAssembly";
import { buildFragmentCatalog } from "./fragmentCatalog";
import { MINIMUM_FRAGMENT_FAMILY_COUNTS } from "./fragmentFamilies";
import { validateFragmentCatalog, validateRecipeAssemblyResult } from "./fragmentValidation";

export type FragmentVerificationReport = Readonly<{ passed: boolean; fragmentCount: number; familyCounts: Record<string, number>; selectedCount: number; issueCount: number; notes: readonly string[] }>;

export function runFragmentVerification(): EngineResult<FragmentVerificationReport> {
  const fragments = buildFragmentCatalog();
  const recipes = buildCreativeRecipeCatalog();
  const dna = generateDesignDNA({ selectedRecipes: recipes.slice(0, 8), industry: "healthcare" }).designDna;
  const assembly = assembleRecipeFromFragments({ baseRecipe: recipes[0], designDna: dna, industries: ["healthcare"], limit: 12 });
  const catalogValidation = validateFragmentCatalog(fragments);
  const assemblyValidation = validateRecipeAssemblyResult(assembly);
  const issues = [...catalogValidation.issues, ...assemblyValidation.issues];
  const familyCounts = fragments.reduce<Record<string, number>>((counts, fragment) => {
    counts[fragment.family] = (counts[fragment.family] ?? 0) + 1;
    return counts;
  }, {});
  for (const family of Object.keys(MINIMUM_FRAGMENT_FAMILY_COUNTS)) {
    familyCounts[family] = familyCounts[family] ?? 0;
  }
  const warning = issues.length ? createEngineWarning("FRAGMENT_VERIFICATION_FAILED", "Creative Fragment verification failed.", "creative-library", "major", { issueCount: issues.length }) : undefined;
  return createEngineResult({
    module: "creative-library",
    stage: "fragment-verification",
    status: issues.length ? "warning" : "ok",
    warnings: warning ? [warning] : [],
    data: {
      passed: issues.length === 0,
      fragmentCount: fragments.length,
      familyCounts,
      selectedCount: assembly.selections.length,
      issueCount: issues.length,
      notes: ["Creative fragments are metadata-only.", "Assembly plans reference a base recipe and fragments without Builder nodes or generated code."],
    },
    metadata: { issues },
  });
}
