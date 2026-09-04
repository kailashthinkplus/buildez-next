import type { TypographyExecutionPlan } from "./DesignExecutionPlan";
import type { DesignFamilyProfile } from "./designRules";

const PLANS: Record<DesignFamilyProfile["typography"], TypographyExecutionPlan> = {
  luxury: { heroScale: "display", headingScale: "editorial", headingWeight: "medium", bodySize: "18px", bodyLineHeight: 1.7, letterSpacing: "-0.02em", bodyMeasure: "narrow", textWidth: "620px", contrast: "high" },
  readable: { heroScale: "moderate", headingScale: "balanced", headingWeight: "semibold", bodySize: "18px", bodyLineHeight: 1.65, letterSpacing: "-0.01em", bodyMeasure: "readable", textWidth: "720px", contrast: "high" },
  editorial: { heroScale: "display", headingScale: "editorial", headingWeight: "medium", bodySize: "18px", bodyLineHeight: 1.65, letterSpacing: "-0.02em", bodyMeasure: "narrow", textWidth: "640px", contrast: "high" },
  "dense-ui": { heroScale: "large", headingScale: "compact", headingWeight: "semibold", bodySize: "16px", bodyLineHeight: 1.55, letterSpacing: "-0.01em", bodyMeasure: "readable", textWidth: "720px", contrast: "strong" },
  bold: { heroScale: "large", headingScale: "balanced", headingWeight: "bold", bodySize: "17px", bodyLineHeight: 1.55, letterSpacing: "-0.015em", bodyMeasure: "readable", textWidth: "700px", contrast: "strong" },
};

export function compileTypographyPlan(profile: DesignFamilyProfile): TypographyExecutionPlan {
  return Object.freeze({ ...PLANS[profile.typography] });
}
