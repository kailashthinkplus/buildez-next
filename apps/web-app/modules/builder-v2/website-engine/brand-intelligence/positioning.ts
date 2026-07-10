import type { BrandFamilyContext, BrandIntelligenceInput, BrandPositioning } from "./brandProfile";

const positioningByFamily: Record<string, Pick<BrandPositioning, "premiumLevel" | "localityPositioning" | "modernClassicSpectrum">> = {
  healthcare: { premiumLevel: "accessible", localityPositioning: "local", modernClassicSpectrum: "balanced" },
  real_estate: { premiumLevel: "premium", localityPositioning: "local", modernClassicSpectrum: "modern" },
  food_and_beverage: { premiumLevel: "accessible", localityPositioning: "local", modernClassicSpectrum: "balanced" },
  automotive: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "modern" },
  education: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "balanced" },
  hospitality: { premiumLevel: "premium", localityPositioning: "regional", modernClassicSpectrum: "balanced" },
  architecture_interiors: { premiumLevel: "premium", localityPositioning: "regional", modernClassicSpectrum: "modern" },
  ecommerce_d2c: { premiumLevel: "accessible", localityPositioning: "global", modernClassicSpectrum: "modern" },
  professional_services: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "balanced" },
  manufacturing_industrial: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "classic" },
  technology_saas: { premiumLevel: "accessible", localityPositioning: "global", modernClassicSpectrum: "modern" },
  ngo_community: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "balanced" },
  government: { premiumLevel: "accessible", localityPositioning: "regional", modernClassicSpectrum: "classic" },
  unknown: { premiumLevel: "accessible", localityPositioning: "local", modernClassicSpectrum: "balanced" },
};

/**
 * Infers brand positioning spectrums without selecting layout or design tokens.
 *
 * @example
 * const positioning = inferBrandPositioning(input, familyContext);
 */
export function inferBrandPositioning(input: BrandIntelligenceInput, familyContext: BrandFamilyContext): BrandPositioning {
  const value = positioningByFamily[familyContext.family] ?? positioningByFamily.unknown;
  const hintedPremium = input.brandHints?.premiumLevel;
  const premiumLevel =
    hintedPremium === "budget" || hintedPremium === "accessible" || hintedPremium === "premium" || hintedPremium === "luxury"
      ? hintedPremium
      : value.premiumLevel;
  return Object.freeze({
    ...value,
    premiumLevel,
    confidence: hintedPremium ? 0.86 : familyContext.family === "unknown" ? 0.35 : 0.7,
    evidence: hintedPremium ? ["brandHints.premiumLevel"] : [`family-default.${familyContext.family}`],
  });
}
