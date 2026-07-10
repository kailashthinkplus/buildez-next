import type { ConversionFrictionPoint, ExperienceFamilyContext, ExperienceInput } from "./experienceStrategy";

const frictionByFamily: Record<string, ConversionFrictionPoint[]> = {
  healthcare: ["privacy concern", "provider credential uncertainty", "appointment availability", "care scope confusion"],
  real_estate: ["availability uncertainty", "pricing unknown", "registration or approval missing", "location fit"],
  food_and_beverage: ["hours unknown", "menu prices unknown", "reservation/delivery availability", "parking/location"],
  automotive: ["authorization uncertainty", "warranty/finance terms", "inventory availability", "service fit"],
  education: ["fees", "eligibility", "outcomes proof", "admissions timeline"],
  ecommerce_d2c: ["product fit", "shipping", "returns", "reviews/proof"],
  hospitality: ["availability", "amenity fit", "location convenience", "booking policy"],
  architecture_interiors: ["style fit", "budget", "timeline", "proof/project relevance"],
  unknown: ["missing business facts", "unclear proof", "unclear conversion path"],
};

/**
 * Infers explicit conversion friction points.
 *
 * @example
 * const friction = inferConversionFrictionPoints(input, familyContext);
 */
export function inferConversionFrictionPoints(input: ExperienceInput, familyContext: ExperienceFamilyContext): ConversionFrictionPoint[] {
  const objections = input.businessProfile?.objections ?? [];
  const missing = input.contentStrategy?.missingContentFacts?.map((fact) => `missing content fact: ${fact}`) ?? [];
  return [...new Set([...(frictionByFamily[familyContext.family] ?? frictionByFamily.unknown), ...objections, ...missing])];
}
