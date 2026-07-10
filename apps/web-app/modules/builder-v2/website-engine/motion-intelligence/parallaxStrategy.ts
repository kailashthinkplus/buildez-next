import type { MotionFamilyContext, MotionInput, ParallaxStrategy } from "./motionStrategy";

/** Infers parallax recommendation. */
export function inferParallaxStrategy(input: MotionInput, context: MotionFamilyContext): ParallaxStrategy {
  const hasMissingMedia = (input.mediaStrategy?.missingAssets.length ?? 0) > 0;
  if (context.family === "healthcare" || hasMissingMedia) return Object.freeze({ level: "None", notes: ["avoid motion that depends on missing or sensitive media"] });
  if (context.family === "real_estate") return Object.freeze({ level: "Medium", notes: ["spatial premium feel", "do not obscure CTAs"] });
  if (context.family === "hospitality") return Object.freeze({ level: "Hero only", notes: ["destination immersion", "booking path remains stable"] });
  if (context.family === "architecture_interiors") return Object.freeze({ level: "Gallery only", notes: ["portfolio depth", "material reveals"] });
  if (context.family === "automotive") return Object.freeze({ level: "Subtle", notes: ["performance feel without heavy scroll tricks"] });
  return Object.freeze({ level: "Subtle", notes: ["support mood, not spectacle"] });
}
