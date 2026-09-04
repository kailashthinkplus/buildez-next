import type { ImageStyleProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers image style metadata.
 *
 * @example
 * const imageStyle = inferImageStyle(input, context);
 */
export function inferImageStyle(input: VisualMoodInput, context: VisualMoodFamilyContext): ImageStyleProfile {
  void input;
  const profile = (primary: ImageStyleProfile["primary"], supporting: ImageStyleProfile["supporting"], avoid: string[]): ImageStyleProfile => Object.freeze({ primary, supporting, avoid });
  if (context.family === "healthcare") return profile("healthcare", ["lifestyle", "commercial"], ["unverified clinical claims"]);
  if (context.family === "food_and_beverage") return profile("hospitality", ["editorial", "lifestyle"], ["invented menu items"]);
  if (context.family === "automotive") return profile("automotive", ["commercial", "editorial"], ["invented inventory or discounts"]);
  if (context.family === "education") return profile("lifestyle", ["documentary", "commercial"], ["fake accreditation or outcomes"]);
  if (context.family === "real_estate" || context.family === "architecture_interiors") return profile("architectural", ["editorial", "luxury"], ["fake availability or awards"]);
  if (context.family === "ecommerce_d2c") return profile("product", ["lifestyle", "commercial"], ["unavailable product shots"]);
  return profile("commercial", ["documentary", "lifestyle"], ["unprovided proof"]);
}
