import type { BrandFamilyContext, BrandIntelligenceInput, BrandTone } from "./brandProfile";

const toneByFamily: Record<string, Pick<BrandTone, "tone" | "formalCasualSpectrum">> = {
  healthcare: { tone: "calm", formalCasualSpectrum: "formal" },
  real_estate: { tone: "premium", formalCasualSpectrum: "balanced" },
  food_and_beverage: { tone: "warm", formalCasualSpectrum: "casual" },
  automotive: { tone: "confident", formalCasualSpectrum: "balanced" },
  education: { tone: "encouraging", formalCasualSpectrum: "balanced" },
  hospitality: { tone: "welcoming", formalCasualSpectrum: "casual" },
  architecture_interiors: { tone: "refined", formalCasualSpectrum: "balanced" },
  ecommerce_d2c: { tone: "helpful", formalCasualSpectrum: "casual" },
  professional_services: { tone: "measured", formalCasualSpectrum: "formal" },
  manufacturing_industrial: { tone: "direct", formalCasualSpectrum: "formal" },
  technology_saas: { tone: "modern", formalCasualSpectrum: "balanced" },
  ngo_community: { tone: "human", formalCasualSpectrum: "balanced" },
  government: { tone: "plain-language", formalCasualSpectrum: "formal" },
  unknown: { tone: "clear", formalCasualSpectrum: "balanced" },
};

/**
 * Infers brand tone and formal/casual spectrum.
 *
 * @example
 * const tone = inferTone(input, familyContext);
 */
export function inferTone(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandTone {
  const hinted = typeof input.brandHints?.tone === "string" ? input.brandHints.tone : undefined;
  const defaultTone = toneByFamily[familyContext.family] ?? toneByFamily.unknown;
  return Object.freeze({
    tone: hinted ?? defaultTone.tone,
    formalCasualSpectrum: defaultTone.formalCasualSpectrum,
    confidence: hinted ? 0.9 : familyContext.family === "unknown" ? 0.35 : 0.72,
    evidence: hinted ? ["brandHints.tone"] : [`family-default.${familyContext.family}`],
  });
}
