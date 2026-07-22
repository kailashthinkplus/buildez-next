import type { MotionFamilyContext, MotionInput, ReducedMotionProfile } from "./motionStrategy";

/** Infers reduced-motion strategy. */
export function inferReducedMotionProfile(input: MotionInput, context: MotionFamilyContext): ReducedMotionProfile {
  void input;
  if (context.family === "healthcare") return Object.freeze({ required: true, strategy: "static-first", notes: ["healthcare prioritizes low anxiety and clarity"] });
  if (context.family === "automotive" || context.family === "hospitality") return Object.freeze({ required: true, strategy: "replace with fades", notes: ["preserve meaning without cinematic movement"] });
  return Object.freeze({ required: true, strategy: "disable decorative motion", notes: ["respect reduced-motion preference"] });
}
