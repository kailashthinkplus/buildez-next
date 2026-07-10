import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates accessibility risk metadata from simulation, motion, and blueprint bindings.
 *
 * @example
 * const result = runAccessibilityCritic({ simulationResult, motionStrategy });
 */
export function runAccessibilityCritic(input: CriticInput): CriticCategoryResult {
  const result = input.simulationResult?.accessibilityResult;
  const score = result?.score ?? 78;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if ((result?.missingAltRisk ?? 0) > 0.7 || (result?.interactiveLabelRisk ?? 0) > 0.7 || score < 50) {
    hardFailures.push(hardFailure("accessibility", "SEVERE_ACCESSIBILITY_RISK", "Severe accessibility risk detected in metadata.", "Repair alt text, labels, contrast, focus, and reduced-motion metadata before publish."));
  }
  if (input.motionStrategy && !input.motionStrategy.reducedMotion.required) {
    issues.push(metadataIssue("accessibility", "major", "Reduced-motion policy is not explicit.", "Require reduced-motion handling for all motion strategies."));
  }
  if (score < 85) {
    recommendations.push(repairRecommendation("accessibility", "high", "Improve accessibility metadata.", "Add alt requirements, labels, heading order, focus states, and reduced-motion notes."));
  }

  return createCategoryResult("accessibility", score, [
    `Accessibility simulation score: ${score}.`,
    `Reduced motion covered: ${result?.reducedMotionCovered ?? Boolean(input.motionStrategy?.reducedMotion.required)}.`,
  ], issues, hardFailures, recommendations, 1.1);
}
