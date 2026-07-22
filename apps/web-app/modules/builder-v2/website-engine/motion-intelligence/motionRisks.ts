import type { MotionFamilyContext, MotionInput, MotionRisk, MotionStrategy } from "./motionStrategy";

function risk(code: string, message: string, severity: MotionRisk["severity"]): MotionRisk {
  return Object.freeze({ code, message, severity });
}

/** Detects motion risks without creating animation code. */
export function detectMotionRisks(input: MotionInput, context: MotionFamilyContext, strategy: Pick<MotionStrategy, "parallaxStrategy" | "performanceProfile">): readonly MotionRisk[] {
  const missingRequiredMedia = input.mediaStrategy?.assetReadiness.missingRequiredCount ?? 0;
  return Object.freeze([
    ...(context.family === "healthcare" ? [risk("HEALTHCARE_LOW_MOTION", "Healthcare motion must avoid anxiety, distraction, and hidden state changes.", "blocker")] : []),
    ...(missingRequiredMedia > 0 ? [risk("MISSING_MEDIA_MOTION_LIMIT", "Asset-dependent motion should be avoided while required media is missing.", "major")] : []),
    ...(strategy.parallaxStrategy.level !== "None" ? [risk("PARALLAX_ACCESSIBILITY", "Parallax requires a reduced-motion alternative and must not hide conversion actions.", "major")] : []),
    ...(strategy.performanceProfile.budget === "expressive" ? [risk("PERFORMANCE_BUDGET", "Expressive motion must remain performance-budgeted and interruptible.", "minor")] : []),
    risk("NO_EXECUTION", "Motion Intelligence defines behavior only; no animation code, CSS, libraries, providers, or Builder nodes are allowed here.", "blocker"),
  ]);
}
