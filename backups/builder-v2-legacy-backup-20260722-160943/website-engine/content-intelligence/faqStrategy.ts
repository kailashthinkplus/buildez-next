import type { ContentFamilyContext, ContentIntelligenceInput, FAQStrategy } from "./contentStrategy";

const faqByFamily: Record<string, string[]> = {
  healthcare: ["appointment process", "care scope", "privacy", "provider availability"],
  real_estate: ["location", "configuration", "site visit", "availability and approvals if provided"],
  food_and_beverage: ["hours", "reservation", "dietary information", "parking or delivery if provided"],
  automotive: ["service booking", "inventory availability", "warranty or financing if provided", "test drive"],
  education: ["admissions", "program duration", "fees if provided", "outcomes proof if provided"],
  ecommerce_d2c: ["shipping", "returns", "product fit", "support"],
  hospitality: ["booking policy", "amenities", "location", "availability if provided"],
  architecture_interiors: ["process", "timeline", "consultation", "portfolio scope"],
  professional_services: ["process", "scope", "consultation", "fees if provided"],
  manufacturing_industrial: ["specifications", "capacity if provided", "quote process", "service area"],
  technology_saas: ["features", "integrations if provided", "security if provided", "demo process"],
  ngo_community: ["program participation", "donations", "volunteering", "impact if provided"],
  government: ["eligibility", "documents", "timelines", "contact path"],
  unknown: ["business fit", "process", "proof", "contact path"],
};

/**
 * Infers FAQ strategy topics without inventing FAQ answers.
 *
 * @example
 * const faq = inferFAQStrategy(input, familyContext);
 */
export function inferFAQStrategy(_input: ContentIntelligenceInput, familyContext: ContentFamilyContext): FAQStrategy {
  return Object.freeze({
    topics: faqByFamily[familyContext.family] ?? faqByFamily.unknown,
    confidence: familyContext.family === "unknown" ? 0.36 : 0.72,
    evidence: [`family-default.${familyContext.family}`],
  });
}
