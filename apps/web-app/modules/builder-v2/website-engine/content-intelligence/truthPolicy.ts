import type { ContentFamilyContext, ContentIntelligenceInput, ContentTruthPolicy } from "./contentStrategy";

const familyTruthRules: Record<string, string[]> = {
  healthcare: ["no cure guarantees", "no fake doctors", "no fake certifications"],
  real_estate: ["no fake availability", "no fake registration numbers", "no fake prices", "no fake awards"],
  food_and_beverage: ["no fake hours", "no fake prices", "no fake reservation or delivery availability"],
  automotive: ["no false brand authorization", "no invented warranty, financing, inventory, or discounts"],
  education: ["no fake placement numbers", "no fake exam results", "no fake accreditation"],
  ecommerce_d2c: ["no fake reviews", "no invented shipping or returns terms", "no fake product claims"],
  hospitality: ["no fake ratings", "no fake awards", "no fake availability"],
  architecture_interiors: ["no invented portfolio projects", "no fake awards", "no fake case studies"],
  professional_services: ["no invented credentials", "no guaranteed outcomes"],
  manufacturing_industrial: ["no fake certifications", "no invented capacity or specifications"],
  technology_saas: ["no fake customers", "no invented uptime, security, compliance, or integrations"],
  ngo_community: ["no invented impact metrics", "no fake testimonials"],
  government: ["no unofficial authority claims", "no invented eligibility or service details"],
  unknown: ["no unsupported claims"],
};

/**
 * Builds the content truth policy that future copywriting must obey.
 *
 * @example
 * const policy = buildContentTruthPolicy(input, familyContext);
 */
export function buildContentTruthPolicy(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): ContentTruthPolicy {
  const constraints = input.brandProfile?.brandConstraints ?? [];
  return Object.freeze({
    rules: [
      ...new Set([
        "missing facts stay missing",
        "do not write final marketing copy in strategy output",
        "omit or request facts before using prices, credentials, awards, testimonials, case studies, statistics, customers, ratings, availability, or guarantees",
        ...(familyTruthRules[familyContext.family] ?? familyTruthRules.unknown),
        ...constraints,
      ]),
    ],
    confidence: 0.96,
    evidence: ["global.truth-policy", `family-default.${familyContext.family}`, ...(constraints.length ? ["brandProfile.brandConstraints"] : [])],
  });
}
