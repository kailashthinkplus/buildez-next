import type { EnergyScale, VisualMoodFamilyContext, VisualMoodInput } from "./visualMoodProfile";

function bounded(score: number) {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

/**
 * Infers energy level.
 *
 * @example
 * const energy = inferEnergyScale(input, context);
 */
export function inferEnergyScale(input: VisualMoodInput, context: VisualMoodFamilyContext): EnergyScale {
  const score = bounded(
    0.38 +
    (input.brandProfile?.energyLevel === "dynamic" ? 0.28 : 0) +
    (input.brandProfile?.energyLevel === "calm" ? -0.16 : 0) +
    (context.family === "automotive" || context.family === "food_and_beverage" || context.family === "ecommerce_d2c" ? 0.18 : 0) +
    (context.family === "healthcare" ? -0.12 : 0)
  );
  return Object.freeze({ level: score >= 0.67 ? "high" : score >= 0.42 ? "medium" : "low", score });
}
