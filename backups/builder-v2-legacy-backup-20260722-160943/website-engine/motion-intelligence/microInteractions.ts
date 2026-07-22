import type { MicroInteractionProfile, MotionFamilyContext, MotionInput } from "./motionStrategy";

/** Infers micro-interaction profile. */
export function inferMicroInteractions(input: MotionInput, context: MotionFamilyContext): MicroInteractionProfile {
  void input;
  const base: MicroInteractionProfile["interactions"] = ["Button hover", "Navigation", "Form feedback"];
  if (context.family === "healthcare") return Object.freeze({ interactions: [...base, "Accordion"], notes: ["support comprehension", "avoid distraction"] });
  if (context.family === "automotive") return Object.freeze({ interactions: [...base, "Card hover", "Progress indicators"], notes: ["responsive service flow"] });
  if (context.family === "food_and_beverage") return Object.freeze({ interactions: [...base, "Image zoom", "Tabs"], notes: ["menu and ambience browsing"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ interactions: [...base, "Card hover", "Image zoom", "Carousels"], notes: ["product confidence"] });
  return Object.freeze({ interactions: [...base, "Card hover"], notes: ["standard interactive feedback"] });
}
