import type { EngineResult } from "../sdk";
import type { SelfPlayInput, SelfPlayResult } from "./selfPlayResult";

/**
 * Validates Self-Play input.
 *
 * @example
 * const validation = validateSelfPlayInput(input);
 */
export function validateSelfPlayInput(input: SelfPlayInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.evolutionResult && !input.winner && !input.criticResult && !input.repairResult) {
    issues.push("Self-play input is sparse; baseline optimization metadata will be used.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Self-play must remain inert with feature flags false.");
  }
  return Object.freeze({ valid: true, issues });
}

/**
 * Validates Self-Play result.
 *
 * @example
 * const validation = validateSelfPlayResult(result);
 */
export function validateSelfPlayResult(result: SelfPlayResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("SelfPlayResult requires an id.");
  if (!result.version) issues.push("SelfPlayResult requires a version.");
  if (!result.bestCandidate) issues.push("Best candidate is required.");
  if (!result.iterationHistory.length) issues.push("Iteration history is required.");
  if (!result.stoppingReason) issues.push("Stopping reason is required.");
  if (result.overallOptimizationScoreProgression.some((score) => score < 0 || score > 100)) issues.push("Optimization scores must be normalized.");
  if (result.appliedRepairPlanMetadata.some((application) => !application.metadataOnly || application.appliedToBuilder)) issues.push("Repair applications must remain metadata-only.");
  if (!result.trace.includes("self-play.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.appliedToBuilder || result.mapperExecuted || result.rendered || result.codeGenerated) issues.push("Self-play result must not have side effects.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates EngineResult<SelfPlayResult>.
 *
 * @example
 * const validation = validateSelfPlayEngineResult(result);
 */
export function validateSelfPlayEngineResult(result: EngineResult<SelfPlayResult>): { valid: boolean; issues: string[] } {
  const validation = validateSelfPlayResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "self-play") issues.push("EngineResult trace module must be self-play.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
