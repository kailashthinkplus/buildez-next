import type { MaterialProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers material direction.
 *
 * @example
 * const materials = inferMaterials(input, context);
 */
export function inferMaterials(input: VisualMoodInput, context: VisualMoodFamilyContext): MaterialProfile {
  const corpus = context.corpus;
  if (context.family === "automotive") return Object.freeze({ primary: ["steel", "glass"], avoid: ["fabric-heavy softness"] });
  if (context.family === "food_and_beverage") return Object.freeze({ primary: ["wood", "fabric", "leather"], avoid: ["cold clinical surfaces"] });
  if (context.family === "healthcare") return Object.freeze({ primary: ["glass", "wood"], avoid: ["visual clutter", "overly dark surfaces"] });
  if (context.family === "architecture_interiors") return Object.freeze({ primary: ["travertine", "wood", "concrete"], avoid: ["generic stock materials"] });
  if (context.family === "real_estate" || input.brandProfile?.premiumLevel === "luxury" || corpus.includes("luxury")) return Object.freeze({ primary: ["marble", "glass", "greenery"], avoid: ["cheap material cues"] });
  return Object.freeze({ primary: ["glass", "wood"], avoid: ["unavailable material claims"] });
}
