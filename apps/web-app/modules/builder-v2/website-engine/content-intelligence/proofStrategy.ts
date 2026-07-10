import type { ContentFamilyContext, ContentIntelligenceInput, ProofStrategy } from "./contentStrategy";

const proofByFamily: Record<string, string[]> = {
  healthcare: ["credentials only if provided", "provider names only if provided", "no cure guarantees"],
  real_estate: ["registration or approval only if provided", "prices and availability only if provided", "awards only if provided"],
  food_and_beverage: ["reviews or awards only if provided", "menu prices only if provided", "reservation/delivery status only if provided"],
  automotive: ["authorization only if provided", "warranty or finance terms only if provided", "inventory only if provided"],
  education: ["accreditation only if provided", "placement or exam results only if provided", "faculty credentials only if provided"],
  ecommerce_d2c: ["reviews only if provided", "shipping and returns only if known", "case studies only if provided"],
  hospitality: ["ratings or awards only if provided", "availability only if provided", "amenity claims only if provided"],
  architecture_interiors: ["portfolio projects only if provided", "client proof only if provided", "awards only if provided"],
  professional_services: ["credentials only if provided", "case studies only if provided"],
  manufacturing_industrial: ["certifications only if provided", "capacity and specifications only if provided"],
  technology_saas: ["customer logos only if provided", "security and uptime claims only if provided"],
  ngo_community: ["impact metrics only if provided", "testimonials only if provided"],
  government: ["official service details only from provided facts"],
  unknown: ["request proof before authority claims"],
};

/**
 * Infers proof strategy from business proof needs and industry-safe defaults.
 *
 * @example
 * const proof = inferProofStrategy(input, familyContext);
 */
export function inferProofStrategy(input: ContentIntelligenceInput, familyContext: ContentFamilyContext): ProofStrategy {
  const proofNeeds = input.businessProfile?.proofNeeds ?? [];
  return Object.freeze({
    requirements: [...new Set([...(proofByFamily[familyContext.family] ?? proofByFamily.unknown), ...proofNeeds])],
    confidence: proofNeeds.length ? 0.84 : familyContext.family === "unknown" ? 0.38 : 0.76,
    evidence: [`family-default.${familyContext.family}`, ...(proofNeeds.length ? ["businessProfile.proofNeeds"] : [])],
  });
}
