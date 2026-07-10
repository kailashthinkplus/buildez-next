import type { BrandFamilyContext, BrandIntelligenceInput, BrandVisualDirection } from "./brandProfile";

const directionByFamily: Record<string, string[]> = {
  healthcare: ["clean information hierarchy", "accessible visual language", "low-risk trust cues"],
  real_estate: ["editorial presentation", "location-led storytelling", "restrained premium feel"],
  food_and_beverage: ["sensory imagery direction", "menu-forward structure", "warm locality cues"],
  automotive: ["precision-led surfaces", "inventory or service clarity", "performance-safe language"],
  education: ["clear program hierarchy", "aspirational but evidence-safe proof", "admissions clarity"],
  hospitality: ["destination-led imagery direction", "amenity clarity", "booking confidence"],
  architecture_interiors: ["portfolio-led visual direction", "material and space sensitivity", "consultative clarity"],
  ecommerce_d2c: ["product clarity", "trust and fulfillment cues", "purchase confidence"],
  professional_services: ["expert clarity", "restrained brand expression", "consultation confidence"],
  manufacturing_industrial: ["technical clarity", "capability-led presentation", "specification confidence"],
  technology_saas: ["product clarity", "modern utility", "demo confidence"],
  ngo_community: ["human impact direction", "transparent participation path", "community warmth"],
  government: ["accessible public information", "official clarity", "service navigation"],
  unknown: ["neutral visual direction pending brand facts"],
};

/**
 * Infers visual direction intent for the future Design Engine.
 *
 * @example
 * const direction = inferVisualDirection(input, familyContext);
 */
export function inferVisualDirection(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandVisualDirection {
  const hinted = Array.isArray(input.brandHints?.visualDirection)
    ? input.brandHints.visualDirection.filter((value): value is string => typeof value === "string")
    : [];
  return Object.freeze({
    direction: [...new Set(hinted.length ? hinted : directionByFamily[familyContext.family] ?? directionByFamily.unknown)],
    confidence: hinted.length ? 0.86 : familyContext.family === "unknown" ? 0.32 : 0.68,
    evidence: hinted.length ? ["brandHints.visualDirection"] : [`family-default.${familyContext.family}`],
  });
}
