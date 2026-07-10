import type { ValidationIssue, ValidationResult } from "../sdk";
import { REPOSITORY_RECORDS } from "../repository";
import { indexRepositoryRecords } from "../graph";
import type { DecisionPlan, DecisionResult } from "./decision";

function issue(path: string, message: string, code = "INVALID_DECISION_PLAN"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

/**
 * Validates one deterministic Decision Plan.
 *
 * @example
 * const validation = validateDecisionPlan(plan);
 */
export function validateDecisionPlan(plan: DecisionPlan): ValidationResult<DecisionPlan> {
  const issues: ValidationIssue[] = [];
  const repositoryIds = new Set(REPOSITORY_RECORDS.map((record) => String(record.id)));
  const graphIds = new Set(indexRepositoryRecords().data.nodes.map((node) => String(node.id)));

  if (!plan.id) issues.push(issue("id", "Decision plan id is required.", "REQUIRED"));
  if (!plan.version) issues.push(issue("version", "Decision plan version is required.", "REQUIRED"));
  if (!plan.selectedArchetype || plan.selectedArchetype === "unknown") {
    issues.push(issue("selectedArchetype", "Exactly one archetype must be selected.", "MISSING_ARCHETYPE"));
  }
  if (!plan.selectedDesignLanguage || plan.selectedDesignLanguage === "unknown") {
    issues.push(issue("selectedDesignLanguage", "Exactly one design language must be selected.", "MISSING_DESIGN_LANGUAGE"));
  }
  if (!plan.selectedCompositionStrategy || plan.selectedCompositionStrategy === "unknown") {
    issues.push(issue("selectedCompositionStrategy", "Exactly one composition strategy must be selected.", "MISSING_COMPOSITION"));
  }
  if (plan.selectedPatternSet.length === 0) {
    issues.push(issue("selectedPatternSet", "Decision plan needs at least one selected pattern.", "MISSING_PATTERNS"));
  }
  if (plan.selectedComponentFamilies.length === 0) {
    issues.push(issue("selectedComponentFamilies", "Decision plan needs at least one component family.", "MISSING_COMPONENTS"));
  }
  for (const recordId of plan.repositoryReferencesUsed) {
    if (!repositoryIds.has(recordId)) {
      issues.push(issue("repositoryReferencesUsed", `Unknown repository reference ${recordId}.`, "INVALID_REPOSITORY_REFERENCE"));
    }
  }
  for (const nodeId of plan.graphReferencesUsed) {
    if (!graphIds.has(nodeId)) {
      issues.push(issue("graphReferencesUsed", `Unknown graph reference ${nodeId}.`, "INVALID_GRAPH_REFERENCE"));
    }
  }
  if (plan.confidence < 0 || plan.confidence > 1) {
    issues.push(issue("confidence", "Decision confidence must be normalized from 0 to 1.", "INVALID_CONFIDENCE"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? plan : undefined,
    issues,
  });
}

/**
 * Validates a Decision Engine result.
 *
 * @example
 * const validation = validateDecisionResult(result);
 */
export function validateDecisionResult(result: DecisionResult): ValidationResult<DecisionResult> {
  const planValidation = validateDecisionPlan(result.plan);
  return Object.freeze({
    valid: planValidation.valid,
    value: planValidation.valid ? result : undefined,
    issues: planValidation.issues,
  });
}
