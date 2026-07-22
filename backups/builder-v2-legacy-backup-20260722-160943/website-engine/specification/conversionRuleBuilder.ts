import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds conversion requirements without creating final copy or UI.
 *
 * @example
 * const rules = buildConversionRules(input);
 */
export function buildConversionRules(input: WebsiteSpecBuilderInput): string[] {
  const rules = unique([
    input.decisionPlan?.selectedCTAStrategy ?? "",
    ...(input.businessProfile?.conversionGoals ?? []),
    ...(input.contentStrategy?.ctaStrategy ?? []),
    ...(input.experienceStrategy?.ctaCadence ?? []),
    ...(input.compositionResult?.ctaCadence.notes ?? []),
  ]);
  return rules.length ? rules : ["Declare primary conversion intent before downstream mapping."];
}
