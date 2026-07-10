import type { BrandAdaptationReport, DesignInput } from "./designIntent";

export function buildBrandAdaptationReport(input: DesignInput): BrandAdaptationReport {
  const usedAssets = [
    ...(input.existingLogo ? ["logo"] : []),
    ...((input.existingColors ?? []).length ? ["colors"] : []),
    ...((input.existingFonts ?? []).length ? ["fonts"] : []),
    ...(input.knownBrandAssets ?? []),
  ];
  const missingAssets = [
    ...(input.existingLogo ? [] : ["logo"]),
    ...((input.existingColors ?? []).length ? [] : ["brand colors"]),
    ...((input.existingFonts ?? []).length ? [] : ["brand fonts"]),
    ...((input.missingAssets ?? []).map((asset) => asset.label)),
  ];
  return Object.freeze({
    usedAssets,
    missingAssets,
    adaptations: ["brand posture mapped to visual language intent", "existing brand assets preserved when provided"],
    risks: missingAssets.length ? ["missing brand assets reduce precision"] : [],
  });
}
