import type { HoverBehavior, MotionFamilyContext, MotionInput } from "./motionStrategy";

/** Infers hover behavior. */
export function inferHoverBehavior(input: MotionInput, context: MotionFamilyContext): HoverBehavior {
  void input;
  if (context.family === "healthcare") return Object.freeze({ tone: "subtle", targets: ["buttons", "forms", "navigation"] });
  if (context.family === "automotive") return Object.freeze({ tone: "responsive", targets: ["service cards", "vehicle cards", "buttons"] });
  if (context.family === "real_estate" || context.family === "architecture_interiors") return Object.freeze({ tone: "elegant", targets: ["gallery cards", "amenity cards", "buttons"] });
  if (context.family === "food_and_beverage") return Object.freeze({ tone: "subtle", targets: ["menu cards", "reservation CTA", "gallery"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ tone: "responsive", targets: ["product cards", "purchase CTA", "image details"] });
  return Object.freeze({ tone: "subtle", targets: ["buttons", "cards", "navigation"] });
}
