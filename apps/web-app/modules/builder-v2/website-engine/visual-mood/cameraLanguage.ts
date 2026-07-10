import type { CameraLanguage, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers camera language as metadata only.
 *
 * @example
 * const camera = inferCameraLanguage(input, context);
 */
export function inferCameraLanguage(input: VisualMoodInput, context: VisualMoodFamilyContext): CameraLanguage {
  void input;
  if (context.family === "real_estate" || context.family === "architecture_interiors") return Object.freeze({ kind: "architectural wide", framing: ["wide spaces", "material detail cutaways"], avoid: ["distorted room scale"] });
  if (context.family === "food_and_beverage") return Object.freeze({ kind: "editorial", framing: ["table-level moments", "ingredient detail"], avoid: ["sterile catalogue framing"] });
  if (context.family === "automotive") return Object.freeze({ kind: "cinematic", framing: ["tracking-feel crops", "surface detail"], avoid: ["unsafe speed claims"] });
  if (context.family === "ecommerce_d2c") return Object.freeze({ kind: "product close-up", framing: ["detail-first", "lifestyle support"], avoid: ["unavailable product claims"] });
  if (context.family === "healthcare" || context.family === "education") return Object.freeze({ kind: "human eye", framing: ["approachable human scale", "clear service context"], avoid: ["privacy-sensitive close-ups"] });
  return Object.freeze({ kind: "documentary", framing: ["credible context", "natural scale"], avoid: ["overproduced ambiguity"] });
}
