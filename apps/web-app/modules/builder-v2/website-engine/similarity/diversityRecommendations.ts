import type { DiversityPenalty, DiversityRecommendation, SimilarityDimension, SimilarityIssue } from "./similarityResult";
import { createSimilarityIssue } from "./similarityResult";

function recommendation(dimension: SimilarityDimension, priority: DiversityRecommendation["priority"], message: string, repairHint: string): DiversityRecommendation {
  return Object.freeze({
    id: `similarity.recommendation.${dimension}.${message.toLowerCase().replace(/[^a-z0-9]+/g, ".").slice(0, 48)}`,
    priority,
    dimension,
    message,
    repairHint,
  });
}

/**
 * Builds diversity recommendations from penalties and overall similarity.
 *
 * @example
 * const recommendations = buildDiversityRecommendations(0.76, penalties);
 */
export function buildDiversityRecommendations(overallSimilarity: number, penalties: readonly DiversityPenalty[]): DiversityRecommendation[] {
  const recommendations: DiversityRecommendation[] = [];
  if (overallSimilarity >= 0.85) {
    recommendations.push(recommendation("design-dna", "critical", "Create stronger visual differentiation.", "Change Design DNA axes, hero treatment, section rhythm, typography, and CTA cadence together."));
  } else if (overallSimilarity >= 0.71) {
    recommendations.push(recommendation("creative-family", "high", "Increase creative diversity before handoff.", "Swap at least one high-impact recipe family and vary fragment families."));
  } else if (overallSimilarity >= 0.56) {
    recommendations.push(recommendation("layout-rhythm", "medium", "Watch for repeated layout rhythm.", "Prefer alternate layout and density rhythm if the same industry/archetype repeats."));
  }

  for (const penalty of penalties) {
    recommendations.push(recommendation(
      penalty.dimension,
      penalty.hardFailure ? "critical" : "high",
      penalty.reason,
      repairHintForPenalty(penalty)
    ));
  }
  return [...new Map(recommendations.map((item) => [item.id, item])).values()];
}

/**
 * Converts diversity penalties into repair hints.
 *
 * @example
 * const hints = buildSimilarityRepairHints(recommendations);
 */
export function buildSimilarityRepairHints(recommendations: readonly DiversityRecommendation[]): string[] {
  return [...new Set(recommendations.map((recommendationItem) => recommendationItem.repairHint))];
}

/**
 * Converts penalties into explicit similarity issues.
 *
 * @example
 * const issues = buildSimilarityIssues(penalties);
 */
export function buildSimilarityIssues(penalties: readonly DiversityPenalty[]): SimilarityIssue[] {
  return penalties.map((penalty) => createSimilarityIssue(
    penalty.dimension,
    penalty.hardFailure ? "blocker" : "major",
    penalty.reason,
    repairHintForPenalty(penalty)
  ));
}

function repairHintForPenalty(penalty: DiversityPenalty): string {
  if (penalty.dimension === "design-dna") return "Vary at least five high-impact Design DNA axes and regenerate the diversity seed.";
  if (penalty.dimension === "recipe-overlap") return "Replace hero, proof, CTA, or trust recipes with different families and variants.";
  if (penalty.dimension === "fragment-overlap") return "Swap fragment families for layout, spacing, typography, CTA, or motion.";
  if (penalty.dimension === "composition-order") return "Change section ordering and component mix, especially the hero-to-proof-to-CTA rhythm.";
  if (penalty.dimension === "layout-rhythm") return "Use a different layout pattern, density transition, and visual breathing profile.";
  return "Introduce deterministic variation in the repeated dimension before Repair or mapping.";
}
