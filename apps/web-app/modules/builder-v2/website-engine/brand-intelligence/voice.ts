import type { BrandFamilyContext, BrandIntelligenceInput, BrandVoice } from "./brandProfile";

const voiceByFamily: Record<string, string> = {
  healthcare: "clear and reassuring",
  real_estate: "editorial and confident",
  food_and_beverage: "sensory and inviting",
  automotive: "precise and assured",
  education: "aspirational and plain-spoken",
  hospitality: "warm and helpful",
  architecture_interiors: "refined and consultative",
  ecommerce_d2c: "clear and product-led",
  professional_services: "expert and accessible",
  manufacturing_industrial: "technical and direct",
  technology_saas: "clear and modern",
  ngo_community: "human and transparent",
  government: "official and accessible",
  unknown: "neutral and clear",
};

/**
 * Infers brand voice from hints or business-family defaults.
 *
 * @example
 * const voice = inferVoice(input, familyContext);
 */
export function inferVoice(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandVoice {
  const hinted = typeof input.brandHints?.voice === "string" ? input.brandHints.voice : undefined;
  return Object.freeze({
    voice: hinted ?? voiceByFamily[familyContext.family] ?? voiceByFamily.unknown,
    confidence: hinted ? 0.9 : familyContext.family === "unknown" ? 0.35 : 0.72,
    evidence: hinted ? ["brandHints.voice"] : [`family-default.${familyContext.family}`],
  });
}
