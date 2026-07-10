import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

function isConversionFocused(input: CriticInput): boolean {
  const goal = `${input.compiledPlan?.selectedWebsiteGoal ?? ""} ${input.compiledPlan?.selectedArchetype ?? ""} ${input.websiteSpec?.archetype ?? ""}`.toLowerCase();
  return /lead|booking|appointment|ecommerce|landing|property|restaurant|hotel|recruitment|saas/.test(goal);
}

/**
 * Evaluates CTA availability and conversion friction metadata.
 *
 * @example
 * const result = runConversionCritic({ compiledPlan, simulationResult });
 */
export function runConversionCritic(input: CriticInput): CriticCategoryResult {
  const conversionFocused = isConversionFocused(input);
  const ctaCount = input.simulationResult?.conversionResult.ctaCount ?? input.compiledPlan?.ctaPlan.length ?? 0;
  const aboveFoldCta = input.simulationResult?.conversionResult.aboveFoldCta ?? ctaCount > 0;
  const frictionRisk = input.simulationResult?.conversionResult.frictionRisk ?? 0.25;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (conversionFocused && ctaCount === 0) {
    hardFailures.push(hardFailure("conversion", "MISSING_PRIMARY_CTA", "Missing primary CTA on a conversion-focused page.", "Add an editable native button CTA with clear action intent."));
  }
  if (conversionFocused && !aboveFoldCta) {
    issues.push(metadataIssue("conversion", "major", "Primary CTA is not early enough for conversion-focused flow.", "Move or duplicate CTA metadata into the above-the-fold plan."));
  }
  if (frictionRisk > 0.35) {
    recommendations.push(repairRecommendation("conversion", "high", "Reduce conversion friction.", "Simplify form, CTA placement, section order, or asset requirements."));
  }

  return createCategoryResult("conversion", (input.simulationResult?.conversionResult.score ?? 82) + Math.min(ctaCount, 3) * 3 - frictionRisk * 15, [
    `Conversion-focused: ${conversionFocused}.`,
    `CTA count: ${ctaCount}.`,
  ], issues, hardFailures, recommendations, 1.1);
}
