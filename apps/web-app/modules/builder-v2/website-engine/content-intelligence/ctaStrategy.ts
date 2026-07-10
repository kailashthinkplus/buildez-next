import type { ContentFamilyContext, ContentIntelligenceInput, CTAStrategy } from "./contentStrategy";

const ctaByFamily: Record<string, string[]> = {
  healthcare: ["appointment CTA", "call or enquiry CTA if appointment facts are missing"],
  real_estate: ["site visit CTA", "project enquiry CTA"],
  food_and_beverage: ["reservation CTA", "order CTA if ordering availability is provided"],
  automotive: ["service booking CTA", "quote CTA", "test-drive CTA if inventory facts exist"],
  education: ["admissions enquiry CTA", "course catalogue CTA"],
  ecommerce_d2c: ["purchase CTA", "product comparison CTA"],
  hospitality: ["booking CTA", "room enquiry CTA"],
  architecture_interiors: ["consultation CTA", "portfolio CTA"],
  professional_services: ["consultation CTA"],
  manufacturing_industrial: ["quote CTA", "specification enquiry CTA"],
  technology_saas: ["demo CTA", "trial CTA if product facts support it"],
  ngo_community: ["donation CTA", "volunteer CTA"],
  government: ["access service CTA", "contact office CTA"],
  unknown: ["clarify primary CTA"],
};

/**
 * Infers CTA strategy without writing button copy.
 *
 * @example
 * const cta = inferCTAStrategy(input, familyContext);
 */
export function inferCTAStrategy(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): CTAStrategy {
  const goals = input.businessProfile?.conversionGoals ?? [];
  return Object.freeze({
    actions: [...new Set([...(ctaByFamily[familyContext.family] ?? ctaByFamily.unknown), ...goals.map((goal) => `support conversion goal: ${goal}`)])],
    confidence: goals.length ? 0.84 : familyContext.family === "unknown" ? 0.35 : 0.7,
    evidence: [`family-default.${familyContext.family}`, ...(goals.length ? ["businessProfile.conversionGoals"] : [])],
  });
}
