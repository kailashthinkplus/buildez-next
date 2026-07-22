import { createEngineWarning, type EngineResult } from "../sdk";
import type { CriticInput } from "./criticInput";
import type { CriticCategory, CriticResult } from "./criticResult";

const REQUIRED_CATEGORIES: CriticCategory[] = [
  "visual-hierarchy", "typography", "spacing", "composition", "design-dna", "creative-library", "content-truth",
  "conversion", "accessibility", "seo", "performance", "mobile", "editability", "renderer-parity", "industry-fit",
  "asset-readiness", "motion",
];

/**
 * Validates critic input without requiring rendered output.
 *
 * @example
 * const validation = validateCriticInput({ simulationResult });
 */
export function validateCriticInput(input: CriticInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.simulationResult && !input.compiledPlan && !input.builderBlueprintResult && !input.mappingPlan) {
    issues.push("Critic input should include at least one upstream metadata artifact.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Critic should run with inert feature flags unless manually testing disabled paths.");
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates a complete critic result contract.
 *
 * @example
 * const validation = validateCriticResult(result);
 */
export function validateCriticResult(result: CriticResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const categorySet = new Set(result.categoryScores.map((score) => score.category));
  if (!result.id) issues.push("Critic result requires an id.");
  if (!result.version) issues.push("Critic result requires a version.");
  for (const category of REQUIRED_CATEGORIES) {
    if (!categorySet.has(category)) issues.push(`Critic result missing category score: ${category}.`);
  }
  if (result.overallScore < 0 || result.overallScore > 100) issues.push("Critic score must be normalized.");
  if (!result.qualityGateResults.length) issues.push("Quality gate results are required.");
  if (!result.repairHints.length && (result.issues.length || result.hardFailures.length)) issues.push("Repair hints are required when issues exist.");
  if (result.hardFailures.length > 0 && result.publishRecommended) issues.push("Hard failures must block publish recommendation.");
  if (result.overallScore < 90 && result.publishRecommended) issues.push("Publish recommendation requires score >= 90.");
  if (result.overallScore < 85 && result.previewReady) issues.push("Preview readiness requires score >= 85.");
  if (result.rendered || result.screenshotCaptured || result.sideEffects) issues.push("Critic result must remain metadata-only.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Converts result validation issues into SDK warnings.
 *
 * @example
 * const warnings = criticValidationWarnings(["Missing category"]);
 */
export function criticValidationWarnings(issues: readonly string[]) {
  return issues.map((issue) => createEngineWarning("CRITIC_VALIDATION", issue, "critic", "major"));
}

/**
 * Validates the EngineResult wrapper shape returned by the critic.
 *
 * @example
 * const ok = validateCriticEngineResult(result).valid;
 */
export function validateCriticEngineResult(result: EngineResult<CriticResult>): { valid: boolean; issues: string[] } {
  const issues = validateCriticResult(result.data).issues;
  if (result.trace.module !== "critic") issues.push("EngineResult trace module must be critic.");
  if (!result.data.trace.includes("critic.metadata-only")) issues.push("Critic trace must record metadata-only execution.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
