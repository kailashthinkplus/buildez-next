import type { SpacingExecutionPlan } from "./DesignExecutionPlan";
import type { DesignFamilyProfile } from "./designRules";

const SPACING: Record<DesignFamilyProfile["density"], SpacingExecutionPlan> = {
  compact: { sectionDensity: "compact", sectionPadding: "80px", containerGap: "32px", componentGap: "24px", cardSpacing: "24px" },
  balanced: { sectionDensity: "balanced", sectionPadding: "96px", containerGap: "40px", componentGap: "32px", cardSpacing: "32px" },
  airy: { sectionDensity: "airy", sectionPadding: "120px", containerGap: "48px", componentGap: "40px", cardSpacing: "48px" },
};

export function compileSpacingPlan(profile: DesignFamilyProfile): SpacingExecutionPlan {
  return Object.freeze({ ...SPACING[profile.density] });
}
