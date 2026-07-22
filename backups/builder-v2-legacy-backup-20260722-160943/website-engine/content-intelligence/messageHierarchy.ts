import type { ContentFamilyContext, ContentIntelligenceInput, MessageHierarchy } from "./contentStrategy";

const hierarchyByFamily: Record<string, string[]> = {
  healthcare: ["care category", "credentials and trust", "service fit", "appointment path", "privacy and FAQ"],
  real_estate: ["location", "project promise", "configuration or offering", "amenities or proof", "site visit CTA"],
  food_and_beverage: ["menu", "ambience", "locality", "hours or availability", "reservation or order path"],
  automotive: ["services or inventory", "proof and reliability", "terms-safe offer", "booking, quote, or test-drive CTA", "FAQ"],
  education: ["programs", "admissions path", "outcomes proof with caution", "student or parent fit", "enquiry CTA"],
  ecommerce_d2c: ["product value proposition", "product details", "proof only if provided", "purchase path", "shipping and returns"],
  hospitality: ["stay experience", "amenities", "location", "booking path", "policy or FAQ"],
  architecture_interiors: ["portfolio narrative", "design process", "service fit", "proof only if provided", "consultation CTA"],
  professional_services: ["expertise area", "service scope", "trust proof", "process", "consultation CTA"],
  manufacturing_industrial: ["capabilities", "specifications", "quality proof if provided", "industries served", "quote CTA"],
  technology_saas: ["problem", "product capability", "proof only if provided", "security or integration caution", "demo CTA"],
  ngo_community: ["cause", "programs", "impact proof only if provided", "participation path", "donation or volunteer CTA"],
  government: ["service purpose", "eligibility or audience", "steps to access", "required documents", "contact or service CTA"],
  unknown: ["business context", "audience", "offer", "proof needs", "conversion goal"],
};

/**
 * Builds the strategic message hierarchy without writing final copy.
 *
 * @example
 * const hierarchy = buildMessageHierarchy(input, familyContext);
 */
export function buildMessageHierarchy(
  input: ContentIntelligenceInput,
  familyContext: ContentFamilyContext
): MessageHierarchy {
  const conversionGoals = input.businessProfile?.conversionGoals ?? [];
  return Object.freeze({
    messages: [...new Set([...(hierarchyByFamily[familyContext.family] ?? hierarchyByFamily.unknown), ...conversionGoals.map((goal) => `conversion goal: ${goal}`)])],
    confidence: familyContext.family === "unknown" ? 0.35 : 0.78,
    evidence: [`family-default.${familyContext.family}`, ...(conversionGoals.length ? ["businessProfile.conversionGoals"] : [])],
  });
}
