import type { LightingProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers lighting direction without generating imagery.
 *
 * @example
 * const lighting = inferLighting(input, context);
 */
export function inferLighting(input: VisualMoodInput, context: VisualMoodFamilyContext): LightingProfile {
  const corpus = context.corpus;
  if (context.family === "healthcare" || corpus.includes("clinical")) return Object.freeze({ kind: "soft", notes: ["soft daylight", "low-anxiety clarity"] });
  if (context.family === "food_and_beverage") return Object.freeze({ kind: "interior ambient", notes: ["warm table-level ambience", "food texture visibility"] });
  if (context.family === "automotive") return Object.freeze({ kind: "dramatic", notes: ["controlled reflections", "precision surface highlights"] });
  if (context.family === "education") return Object.freeze({ kind: "daylight", notes: ["bright optimistic clarity"] });
  if (context.family === "real_estate" || context.family === "hospitality") return Object.freeze({ kind: "golden hour", notes: ["warm premium exterior/interior atmosphere"] });
  if (input.designResult?.designLanguage.name === "Luxury") return Object.freeze({ kind: "golden hour", notes: ["premium warmth", "restrained shadows"] });
  return Object.freeze({ kind: "daylight", notes: ["clear adaptable visual base"] });
}
