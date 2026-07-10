import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds responsive requirements without CSS or layout code.
 *
 * @example
 * const responsive = buildResponsiveRules(input);
 */
export function buildResponsiveRules(input: WebsiteSpecBuilderInput): string[] {
  const rules = unique([
    input.decisionPlan?.selectedResponsiveStrategy ?? "",
    ...(input.designResult?.responsiveProfile.mobile.map((item) => `mobile: ${item}`) ?? []),
    ...(input.designResult?.responsiveProfile.tablet.map((item) => `tablet: ${item}`) ?? []),
    ...(input.designResult?.responsiveProfile.desktop.map((item) => `desktop: ${item}`) ?? []),
    ...(input.compositionResult?.mobileStacking.notes ?? []),
  ]);
  return rules.length ? rules : ["Preserve readable mobile stacking and tappable actions downstream."];
}
