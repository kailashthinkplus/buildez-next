import type { ImageStyleProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers image style metadata.
 *
 * @example
 * const imageStyle = inferImageStyle(input, context);
 */
export function inferImageStyle(input: VisualMoodInput, context: VisualMoodFamilyContext): ImageStyleProfile {
  void input;
  if (context.family === "healthcare") return Object.freeze({ primary: "healthcare", supporting: ["lifestyle", "commercial"], avoid: ["unverified clinical claims"] });
  if (context.family === "food_and_beverage") return Object.freeze({ primary: "hospitality", supporting: ["editorial", "lifestyle"], avoid: ["invented menu items"] });
  if (context.family === "automotive") return Object.freeze({ primary: "automotive", supporting: ["commercial", "editorial"], avoid: ["invented inventory or discounts"] });
  if (context.family === "education") return Object.freeze({ primary: "lifestyle", supporting: ["documentary", "commercial"], avoid: ["fake accreditation or outcomes"] });
  if (context.family === "real_estate" || context.family === "architecture_interiors") return Object.freeze({ primary: "architectural", supporting: ["editorial", "luxury"], avoid: ["fake availability or awards"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ primary: "product", supporting: ["lifestyle", "commercial"], avoid: ["unavailable product shots"] });
  return Object.freeze({ primary: "commercial", supporting: ["documentary", "lifestyle"], avoid: ["unprovided proof"] });
}
