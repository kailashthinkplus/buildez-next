import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput, LocalityProfile } from "./businessProfile";

const LOCALITY_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["clinic location", "service area"],
  real_estate: ["project location", "neighbourhood context"],
  hospitality: ["property location", "nearby access or attractions"],
  food_and_beverage: ["restaurant location", "hours and service area"],
  education: ["campus or delivery location", "admissions geography"],
  beauty_wellness: ["studio location", "service area"],
  fitness: ["facility location", "trial availability"],
  automotive: ["showroom or workshop location", "service area"],
  construction: ["service area", "project geography"],
  architecture_interiors: ["service area", "project geography"],
  professional_services: ["service area"],
  legal_finance: ["jurisdiction or service area"],
  ecommerce_d2c: ["shipping geography"],
  manufacturing_industrial: ["operating region"],
  logistics: ["coverage area"],
  travel: ["destination geography"],
  creative_portfolio: ["service region"],
  ngo_community: ["community or program geography"],
  entertainment_events: ["venue location"],
  technology_saas: ["served markets if relevant"],
  personal_brand: ["operating region if relevant"],
  unknown: ["location or service area missing"],
};

/**
 * Infers locality needs and preserves missing location as a fact need.
 *
 * @example
 * const locality = inferLocalityNeeds(input, classification);
 */
export function inferLocalityNeeds(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): LocalityProfile {
  const location = input.businessContext?.location;
  return Object.freeze({
    needs: [...new Set([...(location ? [`provided location: ${location}`] : []), ...LOCALITY_BY_FAMILY[classification.family]])],
    confidence: location ? 0.84 : 0.58,
    evidence: location ? ["business-context.location", `family-default.${classification.family}`] : [`family-default.${classification.family}`],
  });
}
