import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates whether metadata suggests a clear visual hierarchy.
 *
 * @example
 * const result = runVisualHierarchyCritic({ designDNA, simulationResult });
 */
export function runVisualHierarchyCritic(input: CriticInput): CriticCategoryResult {
  const hasDnaHierarchy = Boolean(input.designDNA?.visualHierarchy);
  const viewportScore = input.simulationResult
    ? Math.round(input.simulationResult.viewportResults.reduce((sum, viewport) => sum + viewport.structureScore, 0) / Math.max(1, input.simulationResult.viewportResults.length))
    : 72;
  const sectionCount = input.compiledPlan?.sections.length ?? input.builderBlueprintResult?.sections.length ?? 0;
  const issues = [];
  const recommendations = [];

  if (!hasDnaHierarchy) {
    issues.push(metadataIssue("visual-hierarchy", "minor", "Design DNA visual hierarchy signal is missing.", "Derive hierarchy traits from selected recipes before final mapping."));
  }
  if (sectionCount === 0) {
    issues.push(metadataIssue("visual-hierarchy", "major", "No section metadata is available for hierarchy review.", "Compile a section plan before critic evaluation."));
  }
  if (viewportScore < 85) {
    recommendations.push(repairRecommendation("visual-hierarchy", "medium", "Strengthen above-the-fold and section hierarchy metadata.", "Adjust section ordering, CTA emphasis, and hero-to-proof rhythm."));
  }

  return createCategoryResult("visual-hierarchy", Math.min(96, viewportScore + (hasDnaHierarchy ? 4 : -6) + Math.min(sectionCount, 8)), [
    hasDnaHierarchy ? "Design DNA hierarchy trait is present." : "Hierarchy depends on weaker upstream signals.",
    `Section metadata count: ${sectionCount}.`,
  ], issues, [], recommendations);
}
