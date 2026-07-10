import type { BuilderBlueprint } from "../../types/blueprint";
import { normalizeBlueprint, stripUndefinedValues } from "./normalizeBlueprint";
import { validateBlueprint, type BuilderOperationResult, operationFailure, operationSuccess } from "../validation";

export function serializeBlueprint(blueprint: BuilderBlueprint): BuilderOperationResult<string> {
  const normalized = stripUndefinedValues(normalizeBlueprint(blueprint));
  const validation = validateBlueprint(normalized);

  if (!validation.valid) {
    return operationFailure(validation.issues);
  }

  return operationSuccess(JSON.stringify(normalized), validation.issues.filter((issue) => issue.severity === "warning"));
}
