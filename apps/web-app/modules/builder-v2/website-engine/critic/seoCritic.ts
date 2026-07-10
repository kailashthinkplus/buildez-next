import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates metadata-only SEO basics.
 *
 * @example
 * const result = runSeoCritic({ simulationResult, compiledPlan });
 */
export function runSeoCritic(input: CriticInput): CriticCategoryResult {
  const seo = input.simulationResult?.seoResult;
  const score = seo?.score ?? (input.compiledPlan?.seoPlan.length ? 84 : 70);
  const issues = [];
  const recommendations = [];

  if (seo && (!seo.hasTitleSignal || !seo.hasHeadingSignal || !seo.hasDescriptionSignal)) {
    issues.push(metadataIssue("seo", "major", "SEO title, heading, or description metadata is incomplete.", "Repair SEO metadata before preview handoff."));
  }
  if ((input.compiledPlan?.seoPlan.length ?? 0) === 0) {
    recommendations.push(repairRecommendation("seo", "medium", "Add SEO plan metadata.", "Carry SEO strategy into the compiled plan."));
  }

  return createCategoryResult("seo", score, [
    `SEO simulation score: ${score}.`,
    `SEO plan items: ${input.compiledPlan?.seoPlan.length ?? 0}.`,
  ], issues, [], recommendations);
}
