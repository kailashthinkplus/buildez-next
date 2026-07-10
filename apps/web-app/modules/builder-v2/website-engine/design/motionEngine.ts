import type { DesignLanguageProfile, MotionProfile } from "./designIntent";

export function buildMotionProfile(language: DesignLanguageProfile): MotionProfile {
  const level = language.motionBehavior.includes("medium") ? "medium" : language.motionBehavior.includes("none") ? "none" : "low";
  return Object.freeze({
    level,
    behavior: [language.motionBehavior, "respect reduced motion", "no animation implementation"],
  });
}
