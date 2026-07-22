import type { MotionFamilyContext, MotionInput, ScrollBehavior } from "./motionStrategy";

/** Infers scroll behavior philosophy. */
export function inferScrollBehavior(input: MotionInput, context: MotionFamilyContext): ScrollBehavior {
  void input;
  if (context.family === "education") return Object.freeze({ strategy: "Narrative", philosophy: ["guided progression", "clear admissions path"] });
  if (context.family === "real_estate" || context.family === "hospitality") return Object.freeze({ strategy: "Editorial", philosophy: ["immersive but conversion-safe", "gallery-friendly pacing"] });
  if (context.family === "architecture_interiors") return Object.freeze({ strategy: "Magazine", philosophy: ["portfolio rhythm", "material-led browsing"] });
  if (context.family === "automotive") return Object.freeze({ strategy: "Presentation", philosophy: ["controlled performance moments", "stable service path"] });
  if (context.family === "healthcare") return Object.freeze({ strategy: "Natural", philosophy: ["low anxiety", "no hidden content"] });
  return Object.freeze({ strategy: "Natural", philosophy: ["predictable reading flow"] });
}
