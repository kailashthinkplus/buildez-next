import type { MotionFamilyContext, MotionInput, TransitionBehavior } from "./motionStrategy";

/** Infers transition behavior. */
export function inferTransitionBehavior(input: MotionInput, context: MotionFamilyContext): TransitionBehavior {
  if (context.family === "healthcare") return Object.freeze({ pacing: "quick", intent: ["clarity", "state change visibility"] });
  if (context.family === "real_estate" || context.family === "hospitality" || input.brandProfile?.premiumLevel === "luxury") return Object.freeze({ pacing: "measured", intent: ["premium restraint", "continuity"] });
  if (context.family === "automotive") return Object.freeze({ pacing: "quick", intent: ["precision", "responsiveness"] });
  return Object.freeze({ pacing: "quick", intent: ["predictable interaction"] });
}
