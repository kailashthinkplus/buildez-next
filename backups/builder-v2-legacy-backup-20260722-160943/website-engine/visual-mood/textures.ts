import type { TextureProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers texture direction.
 *
 * @example
 * const textures = inferTextures(input, context);
 */
export function inferTextures(input: VisualMoodInput, context: VisualMoodFamilyContext): TextureProfile {
  if (context.family === "automotive") return Object.freeze({ primary: ["polished", "industrial"], notes: ["controlled highlights", "precision finish"] });
  if (context.family === "food_and_beverage") return Object.freeze({ primary: ["natural", "handcrafted"], notes: ["ingredient tactility", "warm surfaces"] });
  if (context.family === "architecture_interiors" || input.brandProfile?.premiumLevel === "luxury") return Object.freeze({ primary: ["premium", "natural", "matte"], notes: ["material-led restraint"] });
  if (context.family === "healthcare") return Object.freeze({ primary: ["smooth", "matte"], notes: ["clean and non-intimidating"] });
  return Object.freeze({ primary: ["smooth", "natural"], notes: ["adaptable texture baseline"] });
}
