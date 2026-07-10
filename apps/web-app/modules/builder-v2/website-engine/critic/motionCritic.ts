import type { CriticInput } from "./criticInput";
import { createCategoryResult, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates motion accessibility and performance risk metadata.
 *
 * @example
 * const result = runMotionCritic({ motionStrategy });
 */
export function runMotionCritic(input: CriticInput): CriticCategoryResult {
  const motion = input.motionStrategy;
  const blockerRisk = motion?.risks.filter((risk) => risk.severity === "blocker").length ?? 0;
  const majorRisk = motion?.risks.filter((risk) => risk.severity === "major").length ?? 0;
  const issues = [];
  const recommendations = [];

  if (!motion) {
    issues.push(metadataIssue("motion", "minor", "Motion strategy metadata is missing.", "Add motion language, reduced-motion policy, and performance budget metadata."));
  }
  if (majorRisk > 0 || blockerRisk > 0) {
    issues.push(metadataIssue("motion", blockerRisk > 0 ? "blocker" : "major", "Motion strategy contains accessibility or performance risks.", "Repair motion intensity, reduced-motion policy, and provider assumptions."));
  }
  if (motion?.reducedMotion.strategy === "disable decorative motion") {
    recommendations.push(repairRecommendation("motion", "low", "Keep motion implementation static-first.", "Preserve reduced-motion behavior when Mapper/Renderer are implemented."));
  }

  return createCategoryResult("motion", motion ? 88 - majorRisk * 10 - blockerRisk * 18 : 76, [
    `Motion strategy present: ${Boolean(motion)}.`,
    `Motion risk count: ${motion?.risks.length ?? 0}.`,
  ], issues, [], recommendations);
}
