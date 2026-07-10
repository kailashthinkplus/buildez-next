import type { BusinessFamily } from "../sdk";
import type { BusinessClassification, ComplianceProfile } from "./businessProfile";

const COMPLIANCE_BY_FAMILY: Record<BusinessFamily, string[]> = {
  healthcare: ["do not fabricate doctors", "do not claim credentials without facts", "do not make cure guarantees", "do not invent privacy certifications"],
  real_estate: ["do not fabricate registration numbers", "do not invent prices", "do not claim availability or launch status without facts", "do not invent awards"],
  hospitality: ["do not invent room availability", "do not invent booking policies", "do not claim amenities without facts"],
  food_and_beverage: ["do not invent menu prices", "do not invent hours", "do not claim reservation or delivery availability without facts"],
  education: ["do not fabricate accreditation", "do not invent exam results", "do not invent placement numbers", "do not guarantee admissions"],
  beauty_wellness: ["do not fabricate certifications", "do not guarantee results"],
  fitness: ["do not fabricate trainer credentials", "do not guarantee results"],
  automotive: ["do not claim authorization without facts", "do not invent warranty or finance terms", "do not invent inventory or discounts"],
  construction: ["do not fabricate licenses or project claims"],
  architecture_interiors: ["do not fabricate portfolio projects or awards"],
  professional_services: ["do not fabricate credentials or outcomes"],
  legal_finance: ["do not fabricate licenses, guarantees, or financial claims"],
  ecommerce_d2c: ["do not invent product claims, shipping terms, or return policies"],
  manufacturing_industrial: ["do not invent certifications, capacity, or specifications"],
  logistics: ["do not invent service guarantees or coverage"],
  travel: ["do not invent availability, pricing, or inclusions"],
  creative_portfolio: ["do not fabricate clients, awards, or project results"],
  ngo_community: ["do not fabricate impact metrics"],
  entertainment_events: ["do not invent ticket availability or performers"],
  technology_saas: ["do not fabricate security, compliance, uptime, or integration claims"],
  personal_brand: ["do not fabricate biography, awards, or affiliations"],
  unknown: ["do not make unsupported business claims"],
};

/**
 * Infers compliance guardrails for downstream content and constraints.
 *
 * @example
 * const compliance = inferComplianceNeeds({ family: "automotive", confidence: 0.7, evidence: [] });
 */
export function inferComplianceNeeds(classification: BusinessClassification): ComplianceProfile {
  return Object.freeze({
    needs: COMPLIANCE_BY_FAMILY[classification.family],
    confidence: classification.family === "unknown" ? 0.45 : 0.86,
    evidence: [`compliance-default.${classification.family}`],
  });
}
