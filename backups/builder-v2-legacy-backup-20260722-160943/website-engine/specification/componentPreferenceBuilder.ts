import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds component preferences from selected component metadata.
 *
 * @example
 * const preferences = buildComponentPreferences(input);
 */
export function buildComponentPreferences(input: WebsiteSpecBuilderInput): string[] {
  const preferences = unique([
    ...(input.componentResult?.recommendedSelections.map((selection) => selection.variant.id) ?? []),
    ...(input.componentResult?.componentFamilies ?? []),
    ...(input.decisionPlan?.selectedComponentFamilies ?? []),
  ]);
  return preferences.length ? preferences : ["component.metadata_required"];
}

/**
 * Builds forbidden component or pattern references without hardcoding one industry as root.
 *
 * @example
 * const forbidden = buildForbiddenComponents(input);
 */
export function buildForbiddenComponents(input: WebsiteSpecBuilderInput): string[] {
  return unique([
    ...(input.componentResult?.conflicts.flatMap((conflict) => conflict.componentIds) ?? []),
    ...(input.patternIntelligence?.rejectedPatterns.map((pattern) => pattern.patternId) ?? []),
    ...(input.constraintResult?.violations.map((violation) => `constraint-forbidden:${violation.ruleId}`) ?? []),
  ]);
}
