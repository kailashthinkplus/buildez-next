import type { BrandFamilyContext, BrandEmotion } from "./brandProfile";

const emotionByFamily: Record<string, Pick<BrandEmotion, "emotionalPositioning" | "energyLevel">> = {
  healthcare: { emotionalPositioning: ["safe care", "clarity", "confidence"], energyLevel: "calm" },
  real_estate: { emotionalPositioning: ["aspiration", "trust", "location confidence"], energyLevel: "calm" },
  food_and_beverage: { emotionalPositioning: ["appetite", "warmth", "occasion"], energyLevel: "dynamic" },
  automotive: { emotionalPositioning: ["control", "performance", "reliability"], energyLevel: "dynamic" },
  education: { emotionalPositioning: ["progress", "future confidence", "trust"], energyLevel: "balanced" },
  hospitality: { emotionalPositioning: ["comfort", "escape", "welcome"], energyLevel: "balanced" },
  architecture_interiors: { emotionalPositioning: ["taste", "transformation", "confidence"], energyLevel: "calm" },
  ecommerce_d2c: { emotionalPositioning: ["usefulness", "desire", "purchase confidence"], energyLevel: "balanced" },
  professional_services: { emotionalPositioning: ["clarity", "trust", "reduced risk"], energyLevel: "calm" },
  manufacturing_industrial: { emotionalPositioning: ["capability", "reliability", "precision"], energyLevel: "balanced" },
  technology_saas: { emotionalPositioning: ["efficiency", "clarity", "control"], energyLevel: "balanced" },
  ngo_community: { emotionalPositioning: ["purpose", "belonging", "impact"], energyLevel: "balanced" },
  government: { emotionalPositioning: ["access", "reliability", "public trust"], energyLevel: "calm" },
  unknown: { emotionalPositioning: ["clarity"], energyLevel: "balanced" },
};

/**
 * Infers emotional positioning for future content and experience strategy.
 *
 * @example
 * const emotion = inferEmotion(familyContext);
 */
export function inferEmotion(familyContext: BrandFamilyContext): BrandEmotion {
  const value = emotionByFamily[familyContext.family] ?? emotionByFamily.unknown;
  return Object.freeze({
    ...value,
    confidence: familyContext.family === "unknown" ? 0.35 : 0.74,
    evidence: [`family-default.${familyContext.family}`],
  });
}
