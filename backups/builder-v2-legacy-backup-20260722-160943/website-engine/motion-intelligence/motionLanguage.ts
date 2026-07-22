import type { MotionFamilyContext, MotionInput, MotionLanguage } from "./motionStrategy";

/** Infers overall motion language. */
export function inferMotionLanguage(input: MotionInput, context: MotionFamilyContext): MotionLanguage {
  if (context.family === "healthcare") return "Clinical";
  if (context.family === "food_and_beverage") return "Hospitality";
  if (context.family === "automotive") return "Automotive";
  if (context.family === "education") return "Narrative";
  if (context.family === "real_estate" || context.family === "architecture_interiors") return input.brandProfile?.premiumLevel === "luxury" ? "Luxury" : "Architectural";
  if (context.family === "hospitality") return "Immersive";
  if (context.family === "ecommerce_d2c") return "Product Showcase";
  if (context.family === "technology_saas") return "Technical";
  if (input.brandProfile?.energyLevel === "dynamic") return "Energetic";
  return "Minimal";
}
