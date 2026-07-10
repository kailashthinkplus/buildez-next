import type { MotionFamilyContext, MotionInput, PageTransitionProfile } from "./motionStrategy";

/** Infers page transition philosophy. */
export function inferPageTransitions(input: MotionInput, context: MotionFamilyContext): PageTransitionProfile {
  void input;
  if (context.family === "healthcare") return Object.freeze({ philosophy: "none", notes: ["avoid anxiety and preserve clarity"] });
  if (context.family === "architecture_interiors" || context.family === "real_estate") return Object.freeze({ philosophy: "editorial", notes: ["portfolio continuity only, no blocking motion"] });
  if (context.family === "hospitality") return Object.freeze({ philosophy: "soft continuity", notes: ["destination feel without booking friction"] });
  return Object.freeze({ philosophy: "minimal", notes: ["fast navigation"] });
}
