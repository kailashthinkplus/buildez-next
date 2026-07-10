import type { EngineResult } from "../sdk";
import type { RepairInput } from "./repairInput";
import type { RepairResult } from "./repairPlan";

/**
 * Validates Repair Engine input.
 *
 * @example
 * const validation = validateRepairInput(input);
 */
export function validateRepairInput(input: RepairInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.criticResult && !input.similarityResult && !input.simulationResult && !input.evolutionResult && !input.compiledPlan) {
    issues.push("Repair input is sparse; only baseline repair planning can run.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Repair Engine should remain inert with feature flags false.");
  }
  return Object.freeze({ valid: true, issues });
}

/**
 * Validates Repair Engine result.
 *
 * @example
 * const validation = validateRepairResult(result);
 */
export function validateRepairResult(result: RepairResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Repair result requires an id.");
  if (!result.version) issues.push("Repair result requires a version.");
  if (!result.plan) issues.push("Repair plan is required.");
  if (result.plan.actions.some((action) => !action.target || !action.category || !action.severity)) issues.push("Every action requires target, category, and severity.");
  if (result.plan.actions.some((action) => action.severity === "blocker" && action.priority.score < 80)) issues.push("Hard failures must produce high-priority repair actions.");
  if (result.prioritizedActions.some((action, index) => action.priority.rank !== index + 1)) issues.push("Actions must be prioritized in rank order.");
  if (!result.trace.includes("repair.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.applied || result.rendered || result.builderNodesCreated || result.mapperExecuted) issues.push("Repair result must not apply changes or create output.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates EngineResult<RepairResult>.
 *
 * @example
 * const validation = validateRepairEngineResult(result);
 */
export function validateRepairEngineResult(result: EngineResult<RepairResult>): { valid: boolean; issues: string[] } {
  const validation = validateRepairResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "repair") issues.push("EngineResult trace module must be repair.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
