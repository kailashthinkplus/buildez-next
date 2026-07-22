import type { ExperienceFamilyContext, ExperienceInput, ProofPlacement } from "./experienceStrategy";

const placementByFamily: Record<string, ProofPlacement> = {
  healthcare: ["place credentials before primary appointment CTA", "place privacy/trust reassurance near forms"],
  real_estate: ["place location/proof before site-visit CTA", "place compliance caution before repeated enquiry"],
  food_and_beverage: ["place menu and operational clarity before reservation/order", "place reviews/awards only if provided"],
  automotive: ["place reliability and authorization/terms proof before quote or test-drive", "place service proof near booking"],
  education: ["place program facts before admissions CTA", "place outcomes proof with caution before enquiry"],
  ecommerce_d2c: ["place product proof before purchase CTA", "place shipping/returns near purchase confidence"],
  hospitality: ["place amenities/location before booking CTA", "place ratings/awards only if provided"],
  architecture_interiors: ["place portfolio/process before consultation CTA", "place awards/testimonials only if provided"],
  unknown: ["place proof before conversion CTA"],
};

/**
 * Infers proof placement for the journey.
 *
 * @example
 * const placement = inferProofPlacement(input, familyContext);
 */
export function inferProofPlacement(input: ExperienceInput, familyContext: ExperienceFamilyContext): ProofPlacement {
  const proof = input.contentStrategy?.proofStrategy?.slice(0, 3).map((item) => `proof requirement: ${item}`) ?? [];
  return [...new Set([...(placementByFamily[familyContext.family] ?? placementByFamily.unknown), ...proof])];
}
