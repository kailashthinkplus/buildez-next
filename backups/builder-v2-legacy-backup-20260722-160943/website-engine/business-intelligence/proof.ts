import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, ProofProfile } from "./businessProfile";

const PROOF_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["provider names", "credentials", "care category facts"],
  real_estate: ["project facts", "location facts", "registration or approval facts when claimed"],
  hospitality: ["room or amenity facts", "location facts", "booking policy"],
  food_and_beverage: ["menu items", "hours", "reservation or delivery availability"],
  education: ["course facts", "admissions facts", "faculty or accreditation only if provided"],
  beauty_wellness: ["service list", "practitioner proof if claimed"],
  fitness: ["program list", "trainer or facility proof if claimed"],
  automotive: ["inventory or service facts", "authorization, warranty, financing only if provided"],
  construction: ["project examples", "service scope"],
  architecture_interiors: ["portfolio projects", "process facts"],
  professional_services: ["service scope", "expertise proof"],
  legal_finance: ["qualification facts", "service scope"],
  ecommerce_d2c: ["product details", "shipping and returns"],
  manufacturing_industrial: ["capability facts", "specifications"],
  logistics: ["service area", "fleet or delivery proof only if provided"],
  travel: ["destination facts", "itinerary or booking facts"],
  creative_portfolio: ["portfolio work", "project scope"],
  ngo_community: ["impact facts", "program facts"],
  entertainment_events: ["date", "venue", "ticket information"],
  technology_saas: ["feature facts", "security or integration proof only if provided"],
  personal_brand: ["biography facts", "work proof"],
  unknown: ["business facts needed"],
};

/**
 * Infers proof needs that must later be satisfied by provided facts.
 *
 * @example
 * const proof = inferProofNeeds({ family: "education", confidence: 0.7, evidence: [] });
 */
export function inferProofNeeds(classification: BusinessClassification): ProofProfile {
  return Object.freeze({
    needs: PROOF_BY_FAMILY[classification.family],
    confidence: classification.family === "unknown" ? 0.35 : 0.78,
    evidence: [`proof-default.${classification.family}`],
  });
}
