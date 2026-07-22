import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput, CustomerProfile } from "./businessProfile";

const DEFAULT_AUDIENCE_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["local patients", "care seekers"],
  real_estate: ["property buyers", "site-visit prospects"],
  hospitality: ["travellers", "guests comparing stays"],
  food_and_beverage: ["local diners", "menu browsers"],
  education: ["students", "parents or learners"],
  beauty_wellness: ["appointment seekers"],
  fitness: ["local fitness prospects"],
  automotive: ["vehicle buyers", "service customers"],
  construction: ["project owners"],
  architecture_interiors: ["homeowners", "commercial project owners"],
  professional_services: ["consultation prospects"],
  legal_finance: ["advice seekers"],
  ecommerce_d2c: ["online shoppers"],
  manufacturing_industrial: ["procurement teams"],
  logistics: ["shipping decision-makers"],
  travel: ["trip planners"],
  creative_portfolio: ["project clients"],
  ngo_community: ["supporters", "volunteers"],
  entertainment_events: ["event attendees"],
  technology_saas: ["software buyers"],
  personal_brand: ["followers", "collaboration prospects"],
  unknown: ["target audience unknown"],
};

/**
 * Infers customer profiles from context and safe family defaults.
 *
 * @example
 * const customers = inferCustomerProfiles(input, classification);
 */
export function inferCustomerProfiles(
  input: BusinessIntelligenceInput,
  classification: BusinessClassification
): CustomerProfile {
  const explicit = [
    ...(input.businessContext?.audience ?? []),
    ...(input.intent?.audience ?? []),
  ].filter(Boolean);
  const customerTypes = [...new Set(explicit.length ? explicit : DEFAULT_AUDIENCE_BY_FAMILY[classification.family])];

  return Object.freeze({
    customerTypes,
    confidence: explicit.length ? 0.86 : 0.58,
    evidence: explicit.length ? ["business-context.audience-or-intent.audience"] : [`family-default.${classification.family}`],
  });
}
