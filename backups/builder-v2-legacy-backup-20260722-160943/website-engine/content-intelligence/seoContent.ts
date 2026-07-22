import type { ContentFamilyContext, ContentIntelligenceInput, SEOContentStrategy } from "./contentStrategy";

const seoByFamily: Record<string, string[]> = {
  healthcare: ["care category", "locality", "appointment intent", "provider/service facts"],
  real_estate: ["location", "property type", "configuration facts", "site visit intent"],
  food_and_beverage: ["cuisine", "neighborhood", "menu category", "reservation/order intent"],
  automotive: ["vehicle/service category", "locality", "booking/quote intent", "brand authorization only if provided"],
  education: ["program category", "location or delivery mode", "admissions intent", "course facts"],
  ecommerce_d2c: ["product category", "use case", "purchase intent", "shipping/returns facts"],
  hospitality: ["destination", "stay type", "amenities", "booking intent"],
  architecture_interiors: ["project type", "service area", "portfolio category", "consultation intent"],
  professional_services: ["service category", "industry or audience", "consultation intent"],
  manufacturing_industrial: ["capability", "specifications", "industry served", "quote intent"],
  technology_saas: ["problem category", "product capability", "demo intent"],
  ngo_community: ["cause", "community served", "participation intent"],
  government: ["service name", "audience eligibility", "location or jurisdiction"],
  unknown: ["business category", "audience", "location if relevant"],
};

/**
 * Infers SEO content topics without keyword stuffing.
 *
 * @example
 * const seo = inferSEOContentStrategy(input, familyContext);
 */
export function inferSEOContentStrategy(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): SEOContentStrategy {
  const location = input.businessContext?.location;
  return Object.freeze({
    topics: [...new Set([...(seoByFamily[familyContext.family] ?? seoByFamily.unknown), ...(location ? [`known location: ${location}`] : [])])],
    confidence: location ? 0.82 : familyContext.family === "unknown" ? 0.34 : 0.68,
    evidence: [`family-default.${familyContext.family}`, ...(location ? ["businessContext.location"] : [])],
  });
}
