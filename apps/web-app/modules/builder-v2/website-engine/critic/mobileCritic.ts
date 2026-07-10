import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates mobile plan completeness and early CTA availability.
 *
 * @example
 * const result = runMobileCritic({ simulationResult, compiledPlan });
 */
export function runMobileCritic(input: CriticInput): CriticCategoryResult {
  const responsive = input.simulationResult?.responsiveResult;
  const mobileViewport = input.simulationResult?.viewportResults.find((viewport) => viewport.viewport === "mobile");
  const mobileRules = input.compiledPlan?.responsivePlan.filter((rule) => rule.breakpoint === "mobile").length ?? input.designResult?.responsiveProfile.mobile.length ?? 0;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (mobileRules === 0 || responsive?.hasMobile === false) {
    hardFailures.push(hardFailure("mobile", "MISSING_MOBILE_PLAN", "Missing mobile plan metadata.", "Add mobile responsive rules and stacking metadata before publish."));
  }
  if (mobileViewport && !mobileViewport.ctaReachable) {
    issues.push(metadataIssue("mobile", "major", "Mobile CTA is not reachable early enough.", "Move primary CTA into early mobile viewport metadata."));
  }
  if ((responsive?.stackingRisk ?? 0) > 0.35) {
    recommendations.push(repairRecommendation("mobile", "high", "Reduce mobile stacking risk.", "Adjust section order, spacing, media ratio, and CTA cadence for mobile."));
  }

  return createCategoryResult("mobile", (mobileViewport?.structureScore ?? responsive?.score ?? 78) + Math.min(mobileRules, 5) * 2, [
    `Mobile responsive rule count: ${mobileRules}.`,
    `Mobile viewport available: ${Boolean(mobileViewport)}.`,
  ], issues, hardFailures, recommendations, 1.1);
}
