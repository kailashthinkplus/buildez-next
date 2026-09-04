import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates industry fit without treating real estate as the engine root.
 *
 * @example
 * const result = runIndustryFitCritic({ compiledPlan, creativeLibraryResult });
 */
export function runIndustryFitCritic(input: CriticInput): CriticCategoryResult {
  const industry = input.compiledPlan?.selectedIndustry ?? input.websiteSpec?.business.industryId ?? "unknown";
  const selectedRecipes = input.creativeLibraryResult?.selections ?? [];
  const supportedSelections = selectedRecipes.filter((selection) => selection.recipe.compatibility.supportedIndustries.includes(industry)).length;
  const realEstateRootSignals = input.compiledPlan?.metadata.repositoryReferencesUsed.filter((ref) => /root|foundation/i.test(ref) && /real[-_ ]?estate/i.test(ref)).length ?? 0;
  const issues = [];
  const recommendations = [];

  if (industry === "unknown") {
    issues.push(metadataIssue("industry-fit", "major", "Industry metadata is unknown.", "Resolve business family and industry before final critic evaluation."));
  }
  if (realEstateRootSignals > 0) {
    issues.push(metadataIssue("industry-fit", "major", "Real estate appears to be treated as a foundation reference.", "Keep real estate as one validation fixture, not as the engine root."));
  }
  if (selectedRecipes.length > 0 && supportedSelections === 0) {
    recommendations.push(repairRecommendation("industry-fit", "high", "Select industry-compatible recipes.", "Swap to recipes compatible with the resolved industry or archetype."));
  }

  return createCategoryResult("industry-fit", 80 + Math.min(supportedSelections, 6) * 3 - realEstateRootSignals * 20, [
    `Resolved industry: ${industry}.`,
    `Industry-compatible recipe selections: ${supportedSelections}/${selectedRecipes.length}.`,
  ], issues, [], recommendations);
}
