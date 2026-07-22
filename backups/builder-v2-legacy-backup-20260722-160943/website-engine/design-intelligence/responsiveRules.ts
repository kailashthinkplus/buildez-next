import type { ResponsiveExecutionPlan, SpacingExecutionPlan } from "./DesignExecutionPlan";
import { normalizeDesignFamily } from "./designRules";

export function compileResponsivePlan(family: string | undefined, spacing: SpacingExecutionPlan, maxWidth: string): ResponsiveExecutionPlan {
  const normalized = normalizeDesignFamily(family);
  const dense = ["technology_saas", "saas"].includes(normalized);
  return Object.freeze({
    desktop: Object.freeze({ density: spacing.sectionDensity, maxWidth, columns: dense ? 12 : 12 }),
    tablet: Object.freeze({ columnReduction: dense ? 2 : 1, preserveMediaPriority: ["real_estate", "food_and_beverage", "restaurant", "automotive"].includes(normalized) }),
    mobile: Object.freeze({ stackingPriority: Object.freeze(["headline", "cta", "media", "supporting-copy"] as const), ctaVisible: true, mediaPosition: "after-primary-cta", minimumBodySize: "16px" }),
  });
}
