import type { ContentDensityCurve, ExperienceFamilyContext, ExperienceInput } from "./experienceStrategy";

const densityByFamily: Record<string, ContentDensityCurve> = {
  healthcare: ["low opening density", "medium service detail", "low trust reassurance", "low form friction"],
  real_estate: ["low aspirational opening", "medium project detail", "medium amenities/configuration", "low CTA close"],
  food_and_beverage: ["low sensory opening", "medium menu scan", "low locality/action", "low booking close"],
  automotive: ["low category opening", "high inventory/service scan if facts exist", "medium proof", "low action close"],
  education: ["low aspiration opening", "medium program detail", "medium admissions detail", "low enquiry close"],
  ecommerce_d2c: ["low product promise", "medium product detail", "medium proof/fulfillment", "low purchase close"],
  hospitality: ["low experience opening", "medium amenities/location", "low policy reassurance", "low booking close"],
  architecture_interiors: ["low portfolio opening", "medium process explanation", "medium proof", "low consultation close"],
  unknown: ["low opening", "medium explanation", "low trust", "low action"],
};

/**
 * Infers content density curve for downstream composition.
 *
 * @example
 * const density = inferContentDensityCurve(input, familyContext);
 */
export function inferContentDensityCurve(_input: ExperienceInput, familyContext: ExperienceFamilyContext): ContentDensityCurve {
  return densityByFamily[familyContext.family] ?? densityByFamily.unknown;
}
