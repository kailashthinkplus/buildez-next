import type { BrandFamilyContext, BrandIntelligenceInput, BrandTrustModel } from "./brandProfile";

const trustByFamily: Record<string, Pick<BrandTrustModel, "trustPosture" | "constraints">> = {
  healthcare: { trustPosture: "credentials-and-privacy-first", constraints: ["avoid cure guarantees", "avoid invented credentials"] },
  real_estate: { trustPosture: "approval-and-location-proof-first", constraints: ["avoid invented awards", "avoid invented price or availability claims"] },
  food_and_beverage: { trustPosture: "current-menu-and-locality-first", constraints: ["avoid invented menu prices", "avoid invented hours or delivery claims"] },
  automotive: { trustPosture: "authorization-and-terms-safe", constraints: ["avoid invented warranty or finance terms", "avoid invented inventory"] },
  education: { trustPosture: "outcome-proof-safe", constraints: ["avoid fake accreditation", "avoid placement or admissions guarantees"] },
  hospitality: { trustPosture: "booking-and-amenity-clarity", constraints: ["avoid invented availability", "avoid invented amenities"] },
  architecture_interiors: { trustPosture: "portfolio-and-process-first", constraints: ["avoid invented project results", "avoid invented awards"] },
  ecommerce_d2c: { trustPosture: "product-and-fulfillment-clarity", constraints: ["avoid invented reviews", "avoid invented shipping promises"] },
  professional_services: { trustPosture: "expertise-with-proof", constraints: ["avoid invented credentials", "avoid guaranteed outcomes"] },
  manufacturing_industrial: { trustPosture: "capability-and-specification-first", constraints: ["avoid invented certifications", "avoid invented capacity claims"] },
  technology_saas: { trustPosture: "product-and-security-claims-safe", constraints: ["avoid invented uptime, compliance, security, or customer logos"] },
  ngo_community: { trustPosture: "impact-transparency-first", constraints: ["avoid invented impact metrics", "avoid fake testimonials"] },
  government: { trustPosture: "official-accessibility-first", constraints: ["avoid unofficial claims", "avoid confusing service authority"] },
  unknown: { trustPosture: "proof-required", constraints: ["avoid unsupported brand claims"] },
};

/**
 * Infers trust posture and constraints from the business profile.
 *
 * @example
 * const trust = inferTrustModel(input, familyContext);
 */
export function inferTrustModel(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandTrustModel {
  const value = trustByFamily[familyContext.family] ?? trustByFamily.unknown;
  const complianceConstraints = input.businessProfile?.complianceNeeds ?? [];
  return Object.freeze({
    trustPosture: value.trustPosture,
    constraints: [...new Set([...value.constraints, ...complianceConstraints])],
    confidence: familyContext.family === "unknown" ? 0.42 : 0.82,
    evidence: [`family-default.${familyContext.family}`, ...(complianceConstraints.length ? ["businessProfile.complianceNeeds"] : [])],
  });
}
