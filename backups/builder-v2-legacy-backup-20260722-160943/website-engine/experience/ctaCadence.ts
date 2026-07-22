import type { CTACadence, ExperienceFamilyContext, ExperienceInput } from "./experienceStrategy";

const cadenceByFamily: Record<string, CTACadence> = {
  healthcare: ["soft appointment path early", "primary appointment CTA after trust", "final appointment reminder"],
  real_estate: ["soft enquiry early", "site-visit CTA after location and details", "repeat site-visit CTA after compliance/proof", "final enquiry"],
  food_and_beverage: ["reservation/order path visible early", "repeat near menu", "sticky or reachable mobile action"],
  automotive: ["quote/booking CTA early", "repeat after services or inventory", "test-drive/booking action after proof"],
  education: ["enquiry path early", "admissions CTA after programs", "final admissions or counselling action"],
  ecommerce_d2c: ["purchase path early", "repeat after product details", "final purchase confidence action"],
  hospitality: ["booking path early", "repeat after amenities/location", "final booking action"],
  architecture_interiors: ["portfolio CTA early", "consultation CTA after process", "final consultation action"],
  unknown: ["early soft CTA", "middle trust-gated CTA", "final CTA"],
};

/**
 * Infers CTA cadence for conversion-focused journeys.
 *
 * @example
 * const cadence = inferCTACadence(input, familyContext);
 */
export function inferCTACadence(input: ExperienceInput, familyContext: ExperienceFamilyContext): CTACadence {
  const ctas = input.contentStrategy?.ctaStrategy?.slice(0, 3).map((cta) => `content CTA: ${cta}`) ?? [];
  return [...new Set([...(cadenceByFamily[familyContext.family] ?? cadenceByFamily.unknown), ...ctas])];
}
