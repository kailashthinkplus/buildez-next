import type { DesignExecutionPlan, DesignIntelligenceInput } from "./DesignExecutionPlan";

export type DesignQualityWarning = Readonly<{ code: string; message: string }>;

export type DesignQualityScore = Readonly<{
  typography: number;
  spacing: number;
  hierarchy: number;
  media: number;
  responsive: number;
  overall: number;
  warnings: readonly DesignQualityWarning[];
}>;

type UnscoredPlan = Omit<DesignExecutionPlan, "qualityScore">;

function px(value: string): number {
  return Number.parseFloat(value) || 0;
}

export function calculateDesignQualityScore(plan: UnscoredPlan, input: DesignIntelligenceInput): DesignQualityScore {
  const warnings: DesignQualityWarning[] = [];
  const bodySize = px(plan.typographyPlan.bodySize);
  const typography = Math.min(100, 72 + (bodySize >= 16 ? 12 : 0) + (plan.typographyPlan.bodyLineHeight >= 1.5 ? 8 : 0) + (px(plan.typographyPlan.textWidth) <= 760 ? 8 : 0));
  const sectionPadding = px(plan.spacingPlan.sectionPadding);
  const spacing = Math.min(100, 74 + (sectionPadding >= 80 && sectionPadding <= 140 ? 14 : 0) + (px(plan.spacingPlan.componentGap) >= 24 ? 12 : 0));
  const hierarchy = Math.min(100, 76 + (plan.typographyPlan.heroScale !== "moderate" ? 8 : 6) + (plan.typographyPlan.headingWeight ? 8 : 0) + (plan.typographyPlan.contrast ? 8 : 0));
  const media = Math.min(100, 78 + (plan.mediaPlan.aspectRatioPreference ? 8 : 0) + (plan.mediaPlan.croppingBehavior ? 7 : 0) + (plan.mediaPlan.galleryBehavior ? 7 : 0));
  const responsive = Math.min(100, 74 + (plan.responsivePlan.mobile.ctaVisible ? 10 : 0) + (plan.responsivePlan.mobile.stackingPriority[0] === "headline" ? 8 : 0) + (px(plan.responsivePlan.mobile.minimumBodySize) >= 16 ? 8 : 0));
  if (!input.designResult) warnings.push(Object.freeze({ code: "design-source-missing", message: "DesignResult is missing; family-safe execution defaults were used." }));
  if (!input.brandProfile) warnings.push(Object.freeze({ code: "brand-source-missing", message: "Brand profile is unavailable; premium and energy adaptations are limited." }));
  if (bodySize < 16) warnings.push(Object.freeze({ code: "body-size-accessibility", message: "Body text should remain at least 16px across responsive targets." }));
  const completenessPenalty = (input.designResult ? 0 : 8) + (input.brandProfile ? 0 : 3);
  const overall = Math.max(0, Math.round((typography + spacing + hierarchy + media + responsive) / 5 - completenessPenalty));
  return Object.freeze({ typography, spacing, hierarchy, media, responsive, overall, warnings: Object.freeze(warnings) });
}
