import type { BrandFamilyContext, BrandIntelligenceInput, BrandPersonality } from "./brandProfile";

const personalityByFamily: Record<string, string[]> = {
  real_estate: ["calm", "premium", "editorial", "trust-first", "location-first"],
  healthcare: ["clinical", "reassuring", "credible", "clear", "low-risk"],
  food_and_beverage: ["sensory", "warm", "inviting", "lifestyle", "local"],
  automotive: ["precise", "engineering-led", "performance-aware", "reliable"],
  education: ["aspirational", "trustworthy", "future-focused", "clear"],
  hospitality: ["welcoming", "relaxed", "destination-led", "service-minded"],
  architecture_interiors: ["refined", "portfolio-led", "tasteful", "consultative"],
  ecommerce_d2c: ["clear", "product-led", "trustworthy", "customer-friendly"],
  professional_services: ["credible", "measured", "expert", "clear"],
  manufacturing_industrial: ["capable", "technical", "reliable", "specification-led"],
  technology_saas: ["clear", "modern", "credible", "useful"],
  ngo_community: ["human", "transparent", "cause-led", "inclusive"],
  government: ["accessible", "official", "clear", "public-service"],
  unknown: ["clarity-seeking", "neutral"],
};

/**
 * Infers brand personality without selecting visuals or layouts.
 *
 * @example
 * const personality = inferPersonality(input, familyContext);
 */
export function inferPersonality(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandPersonality {
  const hinted = Array.isArray(input.brandHints?.personality)
    ? input.brandHints.personality.filter((value): value is string => typeof value === "string")
    : [];
  return Object.freeze({
    traits: [...new Set(hinted.length ? hinted : personalityByFamily[familyContext.family] ?? personalityByFamily.unknown)],
    confidence: hinted.length ? 0.88 : familyContext.family === "unknown" ? 0.34 : 0.72,
    evidence: hinted.length ? ["brandHints.personality"] : [`family-default.${familyContext.family}`],
  });
}
