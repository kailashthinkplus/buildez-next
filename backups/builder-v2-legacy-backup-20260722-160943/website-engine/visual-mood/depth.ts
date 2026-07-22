import type { DepthProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers visual depth.
 *
 * @example
 * const depth = inferDepth(input, context);
 */
export function inferDepth(input: VisualMoodInput, context: VisualMoodFamilyContext): DepthProfile {
  const cinematic = input.inspirationProfile?.selectedInspirationCategories.some((item) => item.toLowerCase().includes("cinematic")) ?? false;
  if (cinematic || context.family === "hospitality" || context.family === "real_estate") return Object.freeze({ level: "deep", notes: ["layered spaces", "foreground-to-background storytelling"] });
  if (context.family === "healthcare" || context.family === "education") return Object.freeze({ level: "moderate", notes: ["clear hierarchy", "low visual noise"] });
  return Object.freeze({ level: "moderate", notes: ["balanced spatial clarity"] });
}
