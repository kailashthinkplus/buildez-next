import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds SEO requirements without generating copy.
 *
 * @example
 * const seo = buildSeoRequirements(input);
 */
export function buildSeoRequirements(input: WebsiteSpecBuilderInput): string[] {
  const requirements = unique([
    ...(input.contentStrategy?.seoContentStrategy ?? []),
    input.decisionPlan?.selectedSEOStrategy ?? "",
    ...(input.businessProfile?.localityNeeds.map((item) => `locality SEO: ${item}`) ?? []),
  ]);
  return requirements.length ? requirements : ["Use truthful business, service, and locality metadata only."];
}
