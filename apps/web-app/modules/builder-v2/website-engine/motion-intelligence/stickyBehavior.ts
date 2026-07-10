import type { MotionFamilyContext, MotionInput, StickyBehavior } from "./motionStrategy";

/** Infers sticky behavior policy. */
export function inferStickyBehavior(input: MotionInput, context: MotionFamilyContext): StickyBehavior {
  void input;
  if (context.family === "healthcare" || context.family === "food_and_beverage" || context.family === "automotive") return Object.freeze({ policy: "cta only", notes: ["keep primary action reachable without hiding content"] });
  if (context.family === "real_estate" || context.family === "hospitality") return Object.freeze({ policy: "navigation only", notes: ["support gallery/location browsing"] });
  return Object.freeze({ policy: "navigation only", notes: ["predictable orientation"] });
}
