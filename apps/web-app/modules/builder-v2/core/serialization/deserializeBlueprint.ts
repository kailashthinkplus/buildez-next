import type { BuilderBlueprint } from "../../types/blueprint";
import { isBuilderV2Blueprint } from "../../runtime/isBuilderV2Blueprint";
import { normalizeBlueprint, stripUndefinedValues } from "./normalizeBlueprint";
import { validateBlueprint, operationFailure, operationSuccess, validationIssue, type BuilderOperationResult } from "../validation";

export function deserializeBlueprint(serialized: string): BuilderOperationResult<BuilderBlueprint> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    return operationFailure([
      validationIssue("invalid-json", "Serialized blueprint is not valid JSON."),
    ]);
  }

  if (!isBuilderV2Blueprint(parsed)) {
    return operationFailure([
      validationIssue("invalid-blueprint-shape", "Serialized value is not a Builder v2 blueprint."),
    ]);
  }

  const normalized = stripUndefinedValues(normalizeBlueprint(parsed));
  const validation = validateBlueprint(normalized);

  if (!validation.valid) {
    return operationFailure(validation.issues);
  }

  return operationSuccess(normalized, validation.issues.filter((issue) => issue.severity === "warning"));
}
