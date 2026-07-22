import type { BuilderBlueprint } from "../../types/blueprint";
import { deserializeBlueprint, serializeBlueprint } from "../../core/serialization";
import { validateBlueprint } from "../../core/validation";

export type BlueprintValidationIssue = {
  code: string;
  message: string;
  nodeId?: string;
  path?: string;
};

export type BlueprintValidationResult = {
  valid: boolean;
  issues: BlueprintValidationIssue[];
};

export function validateBlueprintShapeForSpec(value: unknown): BlueprintValidationResult {
  const validation = validateBlueprint(value);
  return {
    valid: validation.valid,
    issues: validation.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      nodeId: issue.nodeId,
      path: issue.path,
    })),
  };
}

export function roundTripBlueprintForSpec(blueprint: BuilderBlueprint): BuilderBlueprint {
  const serialized = serializeBlueprint(blueprint);
  if (serialized.ok === false) {
    throw new Error(serialized.errors.map((issue) => issue.code).join(", "));
  }

  const deserialized = deserializeBlueprint(serialized.value);
  if (deserialized.ok === false) {
    throw new Error(deserialized.errors.map((issue) => issue.code).join(", "));
  }

  return deserialized.value;
}
