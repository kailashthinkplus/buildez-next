import type { BrandAssetProfile, BrandIntelligenceInput } from "./brandProfile";

/**
 * Infers existing brand assets from explicit inputs only.
 *
 * @example
 * const assets = inferExistingAssets({ existingLogo: "logo.svg", existingColors: ["#000"] });
 */
export function inferExistingAssets(input: BrandIntelligenceInput): BrandAssetProfile {
  const assets = [
    ...(input.existingLogo ? ["logo"] : []),
    ...((input.existingColors ?? []).length ? ["colors"] : []),
    ...((input.existingFonts ?? []).length ? ["fonts"] : []),
  ];
  return Object.freeze({
    assets,
    confidence: assets.length ? 0.9 : 0.35,
    evidence: assets.length ? ["explicit-brand-assets"] : ["missing.brand-assets"],
  });
}
