import { createEngineError, type EngineError } from "../sdk";
import type { ComponentResult } from "./componentVariant";

export type ComponentValidationIssue = Readonly<{ path: string; code: string; message: string }>;
export type ComponentValidationResult = Readonly<{ valid: boolean; issues: ComponentValidationIssue[] }>;

function issue(path: string, code: string, message: string): ComponentValidationIssue {
  return Object.freeze({ path, code, message });
}

/** Validates ComponentResult metadata. */
export function validateComponentResult(result: ComponentResult): ComponentValidationResult {
  const issues: ComponentValidationIssue[] = [];
  if (!result.id) issues.push(issue("id", "REQUIRED", "ComponentResult requires an id."));
  if (!result.version) issues.push(issue("version", "REQUIRED", "ComponentResult requires a version."));
  if (result.confidence >= 0.45 && !result.rankedCandidates.length) issues.push(issue("rankedCandidates", "REQUIRED", "Candidates are required when confidence permits."));
  for (const [index, selection] of result.recommendedSelections.entries()) {
    if (!selection.variant.id) issues.push(issue(`recommendedSelections.${index}.variant.id`, "REQUIRED", "Selected component requires id."));
    if (!selection.variant.category) issues.push(issue(`recommendedSelections.${index}.variant.category`, "REQUIRED", "Selected component requires category."));
    if (!selection.variant.family) issues.push(issue(`recommendedSelections.${index}.variant.family`, "REQUIRED", "Selected component requires family."));
    if (!selection.editableMappingIntent) issues.push(issue(`recommendedSelections.${index}.editableMappingIntent`, "REQUIRED", "Editable mapping intent is required."));
  }
  if (!result.qualityChecks.length) issues.push(issue("qualityChecks", "REQUIRED", "Quality checks are required."));
  if (!Array.isArray(result.requiredFacts) || !Array.isArray(result.requiredAssets)) issues.push(issue("requirements", "REQUIRED", "Required facts/assets must be explicit."));
  if (result.confidence < 0 || result.confidence > 1) issues.push(issue("confidence", "NORMALIZED", "Confidence must be between 0 and 1."));
  const serialized = JSON.stringify(result).toLowerCase();
  if (["jsx", "react.createelement", "<div", "{ css", "className=", "buildernode"].some((term) => serialized.includes(term.toLowerCase()))) {
    issues.push(issue("result", "NO_RENDERED_OUTPUT", "ComponentResult must not contain rendered output."));
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

/** Converts validation issues to SDK errors. */
export function validationIssuesToComponentErrors(issues: readonly ComponentValidationIssue[]): EngineError[] {
  return issues.map((item) => createEngineError("INVALID_COMPONENT_RESULT", item.message, "components", true, "major", { path: item.path, code: item.code }));
}
