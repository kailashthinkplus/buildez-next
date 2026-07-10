import { createEngineError, type EngineError } from "../sdk";
import type { CompositionResult } from "./compositionPlan";

export type CompositionValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type CompositionValidationResult = Readonly<{ valid: boolean; issues: CompositionValidationIssue[] }>;

function issue(path: string, code: string, message: string): CompositionValidationIssue {
  return Object.freeze({ path, code, message });
}

export function validateCompositionResult(result: CompositionResult): CompositionValidationResult {
  const issues: CompositionValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "REQUIRED", "CompositionResult requires an id."));
  if (!result.version) issues.push(issue("version", "REQUIRED", "CompositionResult requires a version."));
  if (!result.compositionPlan) issues.push(issue("compositionPlan", "REQUIRED", "Composition plan is required."));
  if (!result.orderedSectionSequence.length) issues.push(issue("orderedSectionSequence", "REQUIRED", "Ordered section sequence is required."));
  if (!result.sectionWeights.length) issues.push(issue("sectionWeights", "REQUIRED", "Section weights are required."));
  if (!result.ctaCadence) issues.push(issue("ctaCadence", "REQUIRED", "CTA cadence is required."));
  if (!result.mobileStacking) issues.push(issue("mobileStacking", "REQUIRED", "Mobile stacking is required."));
  if (!result.qualityChecks.length) issues.push(issue("qualityChecks", "REQUIRED", "Quality checks are required."));
  if (!Array.isArray(result.compositionConflicts)) issues.push(issue("compositionConflicts", "REQUIRED", "Conflicts must be explicit."));
  if (result.confidence < 0 || result.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  const serialized = JSON.stringify(result).toLowerCase();
  if (["<div", "react.createelement", "classname=", "@keyframes", "buildernode"].some((term) => serialized.includes(term))) issues.push(issue("result", "NO_RENDERED_OUTPUT", "CompositionResult must not contain rendered output."));
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validationIssuesToCompositionErrors(issues: readonly CompositionValidationIssue[]): EngineError[] {
  return issues.map((item) => createEngineError("INVALID_COMPOSITION_RESULT", item.message, "composition", true, "major", { path: item.path, code: item.code }));
}
