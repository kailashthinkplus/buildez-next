import type { BrandIntelligenceProfile } from "../sdk";
import type { ContentFamilyContext, ContentIntelligenceInput, TrustCopyStrategy } from "./contentStrategy";

function brandConstraints(brandProfile: BrandIntelligenceProfile | undefined) {
  return brandProfile?.brandConstraints ?? [];
}

/**
 * Infers trust copy rules for future copywriting.
 *
 * @example
 * const trust = inferTrustCopyStrategy(input, familyContext);
 */
export function inferTrustCopyStrategy(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): TrustCopyStrategy {
  const constraints = brandConstraints(input.brandProfile);
  const businessRules = input.businessProfile?.complianceNeeds ?? [];
  return Object.freeze({
    rules: [
      ...new Set([
        "trust statements must map to known facts",
        "do not use testimonials, awards, credentials, prices, ratings, customers, or statistics unless provided",
        ...constraints,
        ...businessRules,
      ]),
    ],
    confidence: constraints.length || businessRules.length ? 0.88 : familyContext.family === "unknown" ? 0.44 : 0.74,
    evidence: [
      "global.truth-rule",
      ...(constraints.length ? ["brandProfile.brandConstraints"] : []),
      ...(businessRules.length ? ["businessProfile.complianceNeeds"] : []),
      `family-default.${familyContext.family}`,
    ],
  });
}
