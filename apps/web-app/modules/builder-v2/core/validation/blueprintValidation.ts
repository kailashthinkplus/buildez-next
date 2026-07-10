import type { BuilderBlueprint } from "../../types/blueprint";
import { isBuilderV2Blueprint } from "../../runtime/isBuilderV2Blueprint";
import { validateBlueprintSchema } from "./blueprintSchema";
import { validateNodeTree } from "./nodeTreeValidation";
import { validateSerializationSafeValues } from "./serializationValidation";
import { buildValidationResult, validationIssue, type BuilderValidationIssue, type BuilderValidationResult } from "./validationResult";

export function validateBlueprint(value: unknown): BuilderValidationResult {
  if (!isBuilderV2Blueprint(value)) {
    return buildValidationResult([
      validationIssue("invalid-blueprint-shape", "Value is not a Builder v2 blueprint shape."),
    ]);
  }

  const schema = validateBlueprintSchema(value);
  if (!schema.valid) {
    return schema;
  }

  const blueprint = value as BuilderBlueprint;
  const issues: BuilderValidationIssue[] = [
    ...schema.issues,
    ...validateNodeTree(blueprint).issues,
    ...validateSerializationSafeValues(blueprint).issues,
  ];

  return buildValidationResult(issues);
}

export function assertValidBlueprint(value: unknown, context = "Builder blueprint"): asserts value is BuilderBlueprint {
  const validation = validateBlueprint(value);
  if (!validation.valid) {
    const details = validation.issues
      .filter((issue) => issue.severity === "error")
      .map(formatValidationIssue)
      .join(", ");
    throw new Error(`${context} failed validation: ${details}`);
  }
}

export function formatValidationIssue(issue: BuilderValidationIssue): string {
  if (issue.code === "invalid-child-relationship") {
    const path = issue.path ? `\nPath: ${issue.path}` : "";
    const node = issue.nodeId ? `\nNode: ${issue.nodeId}` : "";
    return `${issue.code}${node}${path}\n${issue.message}`;
  }

  const path = issue.path ? `:${issue.path}` : "";
  const node = issue.nodeId && !issue.path?.includes(issue.nodeId)
    ? `:${issue.nodeId}`
    : "";

  return `${issue.code}${node}${path}`;
}
