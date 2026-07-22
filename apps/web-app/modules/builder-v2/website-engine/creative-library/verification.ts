import { createEngineResult, createEngineWarning, type EngineResult } from "../sdk";
import { runCreativeLibrary } from "./CreativeLibraryEngine";
import { calculateRecipeDiversityCoverage, selectDiverseCreativeRecipes } from "./recipeDiversity";
import { buildCreativeRecipeCandidates } from "./recipeScoring";
import { getCreativeRecipeFamilyCounts, countCreativeRecipesMissingExpandedMetadata, validateCreativeLibraryResult } from "./validation";

export type CreativeLibraryVerificationReport = Readonly<{
  passed: boolean;
  catalogCount: number;
  familyCounts: Record<string, number>;
  diversityCoverage: number;
  missingMetadataCount: number;
  duplicateCount: number;
  selectedCount: number;
  selectedDiverseSetCount: number;
  issueCount: number;
  warningCount: number;
  safetyBoundaryStatus: "metadata-only";
  notes: readonly string[];
}>;

export function runCreativeLibraryVerification(): EngineResult<CreativeLibraryVerificationReport> {
  const result = runCreativeLibrary({ industries: ["healthcare", "restaurant", "automotive", "education"], limit: 48 }).data;
  const validation = validateCreativeLibraryResult(result);
  const passed = validation.valid;
  const familyCounts = getCreativeRecipeFamilyCounts(result.catalog);
  const candidates = buildCreativeRecipeCandidates(result.catalog, { limit: 80 });
  const diverseSelections = selectDiverseCreativeRecipes(candidates, 80);
  const duplicateCount = result.catalog.length - new Set(result.catalog.map((recipe) => recipe.id)).size;
  const missingMetadataCount = countCreativeRecipesMissingExpandedMetadata(result.catalog);
  const warnings = passed ? [] : [createEngineWarning("CREATIVE_LIBRARY_VERIFICATION_FAILED", "Creative Library verification found issues.", "creative-library", "major", { issueCount: validation.issues.length })];
  return createEngineResult({
    module: "creative-library",
    stage: "verification",
    status: passed ? "ok" : "warning",
    warnings,
    data: {
      passed,
      catalogCount: result.metrics.catalogCount,
      familyCounts,
      diversityCoverage: calculateRecipeDiversityCoverage(result.catalog),
      missingMetadataCount,
      duplicateCount,
      selectedCount: result.metrics.selectedCount,
      selectedDiverseSetCount: diverseSelections.length,
      issueCount: validation.issues.length,
      warningCount: result.metrics.warningCount,
      safetyBoundaryStatus: "metadata-only",
      notes: ["Creative Library is metadata-only.", "No rendering, Builder nodes, React, CSS, HTML, JS, DB, network, MCP, providers, or LLM calls are used."],
    },
    metadata: { issues: [...validation.issues], catalogCount: result.metrics.catalogCount, selectedDiverseSetCount: diverseSelections.length },
  });
}
