import type { ContentFamilyContext, ContentIntelligenceInput, HeadlineStrategy } from "./contentStrategy";

const headlineByFamily: Record<string, string> = {
  healthcare: "lead with care category, trust posture, and appointment intent without medical outcome claims",
  real_estate: "lead with location and project type before lifestyle or site-visit intent",
  food_and_beverage: "lead with cuisine/menu experience, ambience, and locality before reservation/order intent",
  automotive: "lead with service or inventory category and reliability before booking, quote, or test-drive intent",
  education: "lead with program category and learner outcome intent while avoiding fabricated outcomes",
  ecommerce_d2c: "lead with product value proposition and purchase fit while preserving proof requirements",
  hospitality: "lead with stay experience, amenities, and location before booking intent",
  architecture_interiors: "lead with portfolio fit and design process before consultation intent",
  professional_services: "lead with expertise area and problem fit before consultation intent",
  manufacturing_industrial: "lead with capability and specification fit before quote intent",
  technology_saas: "lead with user problem and product capability before demo intent",
  ngo_community: "lead with cause and participation path before donation or volunteer intent",
  government: "lead with service purpose and access path in plain language",
  unknown: "lead with clarified business category before conversion intent",
};

/**
 * Infers headline strategy without writing a headline.
 *
 * @example
 * const headline = inferHeadlineStrategy(input, familyContext);
 */
export function inferHeadlineStrategy(
  input: ContentIntelligenceInput,
  familyContext: ContentFamilyContext
): HeadlineStrategy {
  const brandTone = input.brandProfile?.tone;
  return Object.freeze({
    strategy: brandTone
      ? `${headlineByFamily[familyContext.family] ?? headlineByFamily.unknown}; keep tone ${brandTone}`
      : headlineByFamily[familyContext.family] ?? headlineByFamily.unknown,
    confidence: brandTone ? 0.82 : familyContext.family === "unknown" ? 0.32 : 0.72,
    evidence: [`family-default.${familyContext.family}`, ...(brandTone ? ["brandProfile.tone"] : [])],
  });
}
