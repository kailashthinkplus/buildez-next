export const VISUAL_QUALITY_RULES = Object.freeze({
  minimumBodyFontSize: 16,
  minimumSectionSpacing: 64,
  maximumSectionSpacing: 160,
  maximumConsecutiveCardComponents: 2,
  minimumComponentPatterns: 3,
  minimumScore: 70,
  premiumScore: 85,
});

export function clampVisualScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
