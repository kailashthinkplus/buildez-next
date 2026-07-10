import type { ExperienceFamilyContext, ExperienceInput, InteractionRhythm } from "./experienceStrategy";

const interactionByFamily: Record<string, InteractionRhythm> = {
  healthcare: ["low motion", "clear forms", "accessible appointment path", "avoid anxiety-inducing interactions"],
  real_estate: ["guided exploration", "gallery/location interactions later", "site-visit CTA remains clear"],
  food_and_beverage: ["fast menu access", "short reservation/order interaction", "mobile action remains reachable"],
  automotive: ["filter/search only after inventory facts exist", "booking/test-drive interaction clear", "avoid false availability states"],
  education: ["program exploration", "admissions path clarity", "low-friction enquiry"],
  ecommerce_d2c: ["product detail interaction", "purchase path clarity", "fulfillment reassurance near action"],
  hospitality: ["room/amenity exploration", "booking path clarity", "availability only if facts exist"],
  architecture_interiors: ["portfolio browsing", "process reveal", "consultation path clarity"],
  unknown: ["simple interactions", "clear conversion path", "avoid unsupported dynamic states"],
};

/**
 * Infers interaction rhythm without choosing final components.
 *
 * @example
 * const rhythm = inferInteractionRhythm(input, familyContext);
 */
export function inferInteractionRhythm(_input: ExperienceInput, familyContext: ExperienceFamilyContext): InteractionRhythm {
  return interactionByFamily[familyContext.family] ?? interactionByFamily.unknown;
}
