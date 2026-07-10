import type { DensityProfile, DesignInput } from "./designIntent";

export function buildDensityProfile(input: DesignInput): DensityProfile {
  const curve = input.experienceStrategy?.contentDensityCurve ?? ["low opening", "medium body", "low conversion"];
  const level = curve.some((item) => item.includes("high")) ? "dense" : curve.some((item) => item.includes("low")) ? "airy" : "balanced";
  return Object.freeze({ level, curve });
}
