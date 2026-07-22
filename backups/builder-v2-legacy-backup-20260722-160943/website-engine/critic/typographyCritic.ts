import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates typography rhythm from Design DNA, design output, and blueprint headings.
 *
 * @example
 * const result = runTypographyCritic({ designDNA, builderBlueprintResult });
 */
export function runTypographyCritic(input: CriticInput): CriticCategoryResult {
  const rhythm = input.designDNA?.typographyRhythm ?? input.designResult?.typographyProfile?.headingFamily;
  const headingCount = input.builderBlueprintResult?.blueprint.widgets.filter((widget) => widget.type === "heading").length ?? 0;
  const issues = [];
  const recommendations = [];

  if (!rhythm) {
    issues.push(metadataIssue("typography", "minor", "Typography rhythm metadata is missing.", "Use Brand, Design DNA, or Design Engine typography rhythm before mapping."));
  }
  if (input.builderBlueprintResult && headingCount === 0) {
    issues.push(metadataIssue("typography", "major", "Blueprint metadata has no heading widgets.", "Map at least one native heading with editable typography controls."));
  }
  if (headingCount < 2) {
    recommendations.push(repairRecommendation("typography", "medium", "Improve heading hierarchy metadata.", "Ensure sections include editable heading levels and body text roles."));
  }

  return createCategoryResult("typography", 82 + (rhythm ? 10 : -8) + Math.min(headingCount, 4), [
    rhythm ? `Typography rhythm: ${rhythm}.` : "Typography rhythm was not provided.",
    `Heading widget count: ${headingCount}.`,
  ], issues, [], recommendations);
}
