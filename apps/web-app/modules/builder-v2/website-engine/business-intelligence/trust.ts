import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, BusinessIntelligenceInput, TrustProfile } from "./businessProfile";

const TRUST_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["provider credentials required", "privacy posture required", "service scope clarity"],
  real_estate: ["registration or approval facts required", "location proof required", "availability and pricing must be explicit if used"],
  hospitality: ["location and amenity clarity", "booking policy clarity", "guest proof if provided"],
  food_and_beverage: ["current menu clarity", "hours and reservation facts required", "location clarity"],
  education: ["program clarity", "faculty or accreditation proof only when provided", "admissions process clarity"],
  beauty_wellness: ["service expertise", "hygiene or certification proof only when provided"],
  fitness: ["facility or trainer proof only when provided", "membership terms clarity"],
  automotive: ["authorization proof only when provided", "warranty and finance terms must be explicit if used"],
  construction: ["process clarity", "project proof only when provided"],
  architecture_interiors: ["portfolio evidence", "process clarity"],
  professional_services: ["expertise proof", "scope clarity"],
  legal_finance: ["qualification proof only when provided", "risk disclosure sensitivity"],
  ecommerce_d2c: ["shipping and returns clarity", "product proof"],
  manufacturing_industrial: ["capability proof", "specification clarity"],
  logistics: ["service area clarity", "reliability proof only when provided"],
  travel: ["itinerary clarity", "booking policy clarity"],
  creative_portfolio: ["portfolio evidence", "client proof only when provided"],
  ngo_community: ["impact proof only when provided", "transparency needs"],
  entertainment_events: ["date and venue clarity", "ticket terms clarity"],
  technology_saas: ["security or compliance claims only when provided", "demo fit clarity"],
  personal_brand: ["credible biography", "proof only when provided"],
  unknown: ["trust requirements unknown"],
};

/**
 * Infers trust signals without fabricating proof points.
 *
 * @example
 * const trust = inferTrustProfile(input, classification);
 */
export function inferTrustProfile(input: BusinessIntelligenceInput, classification: BusinessClassification): TrustProfile {
  const providedProof = input.businessContext?.proofPoints ?? [];
  return Object.freeze({
    signals: [...new Set([...providedProof, ...TRUST_BY_FAMILY[classification.family]])],
    confidence: providedProof.length ? 0.84 : 0.68,
    evidence: providedProof.length ? ["business-context.proofPoints", `family-default.${classification.family}`] : [`family-default.${classification.family}`],
  });
}
