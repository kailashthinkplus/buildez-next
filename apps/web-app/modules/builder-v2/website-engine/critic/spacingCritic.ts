import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates spacing consistency from DNA, responsive simulation, and style bindings.
 *
 * @example
 * const result = runSpacingCritic({ designDNA, simulationResult });
 */
export function runSpacingCritic(input: CriticInput): CriticCategoryResult {
  const whitespace = input.designDNA?.whitespaceLevel ?? (input.designResult?.spacingProfile ? `sectionY:${input.designResult.spacingProfile.sectionY}` : undefined);
  const responsiveScore = input.simulationResult?.responsiveResult.score ?? 76;
  const styleBindingCount = input.builderBlueprintResult?.styleBindings.length ?? input.mappingPlan?.stylePlan.length ?? 0;
  const issues = [];
  const recommendations = [];

  if (!whitespace) {
    issues.push(metadataIssue("spacing", "minor", "Whitespace or density metadata is missing.", "Create spacing traits from Design DNA before repair or mapping."));
  }
  if (responsiveScore < 80) {
    issues.push(metadataIssue("spacing", "major", "Responsive simulation indicates spacing or stacking risk.", "Repair responsive spacing rules for desktop, tablet, and mobile."));
  }
  if (styleBindingCount === 0) {
    recommendations.push(repairRecommendation("spacing", "medium", "Add explicit style binding metadata.", "Preserve spacing as editable native style bindings."));
  }

  return createCategoryResult("spacing", responsiveScore + (whitespace ? 8 : -6) + Math.min(styleBindingCount, 6), [
    whitespace ? `Whitespace level: ${whitespace}.` : "Whitespace level unavailable.",
    `Style binding count: ${styleBindingCount}.`,
  ], issues, [], recommendations);
}
