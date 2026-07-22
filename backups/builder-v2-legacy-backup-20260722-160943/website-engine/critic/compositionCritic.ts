import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates section composition, repetition, and quality gate metadata.
 *
 * @example
 * const result = runCompositionCritic({ compiledPlan, simulationResult });
 */
export function runCompositionCritic(input: CriticInput): CriticCategoryResult {
  const sections = input.compiledPlan?.sections ?? [];
  const qualityGateCount = input.compiledPlan?.qualityGates.length ?? 0;
  const repeatedTypes = sections.filter((section, index) => index > 1 && section.type === sections[index - 1]?.type && section.type === sections[index - 2]?.type);
  const issues = [];
  const recommendations = [];

  if (sections.length === 0) {
    issues.push(metadataIssue("composition", "major", "No compiled section plan is available.", "Compile mapper-ready sections before critic evaluation."));
  }
  if (repeatedTypes.length > 0) {
    issues.push(metadataIssue("composition", "major", "Three consecutive sections use the same type.", "Vary section rhythm using compatible patterns or recipe fragments."));
  }
  if (qualityGateCount === 0) {
    recommendations.push(repairRecommendation("composition", "medium", "Add composition quality gates.", "Carry compiler quality gates into the compiled plan."));
  }

  return createCategoryResult("composition", 78 + Math.min(sections.length, 10) * 2 + Math.min(qualityGateCount, 6) - repeatedTypes.length * 12, [
    `Compiled section count: ${sections.length}.`,
    `Composition quality gate count: ${qualityGateCount}.`,
  ], issues, [], recommendations);
}
