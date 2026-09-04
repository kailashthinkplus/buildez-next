export const COMPOSITION_QUALITY_PASS_SCORE = 70;

export const COMPOSITION_QUALITY_WEIGHTS = Object.freeze({
  rhythm: 0.2,
  trust: 0.2,
  conversion: 0.2,
  visualBalance: 0.2,
  density: 0.2,
});

export const COMPOSITION_QUALITY_RULES = Object.freeze({
  maximumConsecutiveCardSections: 2,
  maximumPrimaryConversionSections: 2,
  visualVariationInterval: 2,
  trustMustPrecedeFinalConversion: true,
});

export function clampQualityScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
