import type { MotionFamilyContext, MotionInput, MotionPerformanceProfile } from "./motionStrategy";

/** Infers motion performance profile. */
export function inferPerformanceProfile(input: MotionInput, context: MotionFamilyContext): MotionPerformanceProfile {
  const missingMedia = input.mediaStrategy?.assetReadiness.missingRequiredCount ?? 0;
  if (context.family === "healthcare" || missingMedia > 0) return Object.freeze({ budget: "strict", constraints: ["no heavy scroll effects", "no asset-dependent motion", "preserve mobile responsiveness"] });
  if (context.family === "hospitality" || context.family === "real_estate") return Object.freeze({ budget: "balanced", constraints: ["limit parallax layers", "prioritize conversion CTA stability"] });
  return Object.freeze({ budget: "balanced", constraints: ["avoid layout shift", "keep motion interruptible"] });
}
