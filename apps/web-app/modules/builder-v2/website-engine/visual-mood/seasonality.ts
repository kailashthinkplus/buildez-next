import type { SeasonalityProfile, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

/**
 * Infers recommended season as mood metadata.
 *
 * @example
 * const season = inferSeasonality(input, context);
 */
export function inferSeasonality(input: VisualMoodInput, context: VisualMoodFamilyContext): SeasonalityProfile {
  void input;
  if (context.family === "food_and_beverage" || context.family === "hospitality") return Object.freeze({ recommendedSeason: "evergreen", rationale: "Hospitality and food concepts should avoid locking core mood to one season unless provided." });
  if (context.family === "education") return Object.freeze({ recommendedSeason: "spring", rationale: "Spring supports aspirational growth without inventing admissions dates." });
  if (context.family === "automotive") return Object.freeze({ recommendedSeason: "evergreen", rationale: "Vehicle/service mood should remain campaign-neutral." });
  return Object.freeze({ recommendedSeason: "evergreen", rationale: "No season-specific fact was provided." });
}
