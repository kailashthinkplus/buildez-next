import type { MotionFamilyContext, MotionInput, RevealStrategy } from "./motionStrategy";

/** Infers section reveal strategy. */
export function inferRevealStrategy(input: MotionInput, context: MotionFamilyContext): RevealStrategy {
  void input;
  if (context.family === "healthcare") return Object.freeze({ primary: "Minimal reveal", secondary: ["Fade"], avoid: ["mask-heavy reveals", "surprise motion"] });
  if (context.family === "automotive") return Object.freeze({ primary: "Slide", secondary: ["Layer reveal"], avoid: ["bouncy movement"] });
  if (context.family === "real_estate" || context.family === "architecture_interiors" || context.family === "hospitality") return Object.freeze({ primary: "Editorial stagger", secondary: ["Layer reveal", "Fade"], avoid: ["fast novelty reveals"] });
  if (context.family === "food_and_beverage") return Object.freeze({ primary: "Fade", secondary: ["Scale"], avoid: ["menu-disrupting reveals"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ primary: "Scale", secondary: ["Fade"], avoid: ["purchase path instability"] });
  return Object.freeze({ primary: "Fade", secondary: ["Minimal reveal"], avoid: ["excessive motion"] });
}
