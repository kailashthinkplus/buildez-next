import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, ObjectionProfile } from "./businessProfile";

const OBJECTIONS_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["privacy", "provider suitability", "appointment availability", "care scope"],
  real_estate: ["price clarity", "availability", "location fit", "approval status"],
  hospitality: ["availability", "amenity fit", "location convenience", "booking policy"],
  food_and_beverage: ["menu fit", "hours", "reservation availability", "delivery availability"],
  education: ["program fit", "admissions requirements", "outcomes proof", "fees"],
  beauty_wellness: ["service fit", "availability", "practitioner credibility"],
  fitness: ["membership fit", "facility quality", "schedule"],
  automotive: ["inventory", "warranty terms", "finance terms", "authorization"],
  construction: ["budget", "timeline", "process confidence"],
  architecture_interiors: ["style fit", "budget", "timeline"],
  professional_services: ["expertise fit", "pricing", "availability"],
  legal_finance: ["risk", "qualification", "scope"],
  ecommerce_d2c: ["product fit", "shipping", "returns", "trust"],
  manufacturing_industrial: ["specification fit", "capacity", "lead time"],
  logistics: ["coverage", "reliability", "pricing"],
  travel: ["availability", "itinerary fit", "booking policy"],
  creative_portfolio: ["style fit", "budget", "availability"],
  ngo_community: ["impact credibility", "transparency", "participation path"],
  entertainment_events: ["date fit", "venue access", "ticket availability"],
  technology_saas: ["fit", "security", "integration", "pricing"],
  personal_brand: ["relevance", "credibility", "contact path"],
  unknown: ["business fit unknown"],
};

/**
 * Infers likely objections for content strategy and QA.
 *
 * @example
 * const objections = inferObjections({ family: "real_estate", confidence: 0.8, evidence: [] });
 */
export function inferObjections(classification: BusinessClassification): ObjectionProfile {
  return Object.freeze({
    objections: OBJECTIONS_BY_FAMILY[classification.family],
    confidence: classification.family === "unknown" ? 0.35 : 0.72,
    evidence: [`objection-default.${classification.family}`],
  });
}
