import type { VisualEmotion, VisualMoodInput, VisualMoodFamilyContext } from "./visualMoodProfile";

/**
 * Infers the primary visual emotion.
 *
 * @example
 * const emotion = inferPrimaryEmotion(input, context);
 */
export function inferPrimaryEmotion(input: VisualMoodInput, context: VisualMoodFamilyContext): VisualEmotion {
  const corpus = context.corpus;
  if (context.family === "healthcare" || corpus.includes("clinical")) return "trustworthy";
  if (context.family === "food_and_beverage" || corpus.includes("sensory")) return "energetic";
  if (context.family === "automotive" || corpus.includes("precision")) return "technical";
  if (context.family === "education" || corpus.includes("aspiration")) return "inspiring";
  if (context.family === "hospitality" || corpus.includes("destination")) return "adventurous";
  if (context.family === "architecture_interiors" || corpus.includes("editorial")) return "elegant";
  if (context.family === "ecommerce_d2c" || corpus.includes("product")) return "energetic";
  if (input.brandProfile?.premiumLevel === "luxury" || corpus.includes("luxury")) return "luxurious";
  return "calm";
}

/**
 * Infers the secondary visual emotion.
 *
 * @example
 * const emotion = inferSecondaryEmotion(input, context, "trustworthy");
 */
export function inferSecondaryEmotion(input: VisualMoodInput, context: VisualMoodFamilyContext, primary: VisualEmotion): VisualEmotion {
  const corpus = context.corpus;
  if (primary !== "trustworthy" && (context.family === "healthcare" || corpus.includes("trust"))) return "trustworthy";
  if (primary !== "luxurious" && (input.brandProfile?.premiumLevel === "luxury" || corpus.includes("premium"))) return "luxurious";
  if (primary !== "elegant" && (context.family === "real_estate" || context.family === "architecture_interiors")) return "elegant";
  if (primary !== "playful" && corpus.includes("playful")) return "playful";
  if (primary !== "technical" && context.family === "technology_saas") return "technical";
  if (primary !== "calm") return "calm";
  return "trustworthy";
}
