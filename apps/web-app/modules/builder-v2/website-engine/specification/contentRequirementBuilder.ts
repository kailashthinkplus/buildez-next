import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function unique(values: readonly string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Builds canonical content requirements from content, business, and experience strategy.
 *
 * @example
 * const requirements = buildContentRequirements(input);
 */
export function buildContentRequirements(input: WebsiteSpecBuilderInput): string[] {
  const requirements = unique([
    ...(input.contentStrategy?.messageHierarchy ?? []),
    input.contentStrategy?.headlineStrategy ?? "",
    ...(input.contentStrategy?.proofStrategy ?? []),
    ...(input.contentStrategy?.faqStrategy ?? []),
    ...(input.contentStrategy?.trustCopyRules ?? []),
    ...(input.contentStrategy?.objectionHandling ?? []),
    ...(input.contentStrategy?.localityContent ?? []),
    ...(input.contentStrategy?.complianceCopyRules ?? []),
    ...(input.businessProfile?.proofNeeds.map((item) => `proof need: ${item}`) ?? []),
    ...(input.experienceStrategy?.proofPlacement.map((item) => `proof placement: ${item}`) ?? []),
  ]);
  return requirements.length ? requirements : ["Use verified business facts only; keep missing content explicit."];
}
