import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { validateBlueprint } from "../validation";
import { operationFailure, operationSuccess, validationIssue, type BuilderOperationResult, type BuilderValidationIssue } from "../validation/validationResult";

const UNSAFE_REPAIR_CODES = new Set([
  "missing-root",
  "root-not-page",
  "root-has-parent",
  "missing-parent",
  "child-parent-mismatch",
  "child-has-multiple-parents",
  "cycle-detected",
  "orphan-node",
  "non-root-without-parent",
  "invalid-child-relationship",
  "invalid-node-type",
  "invalid-blueprint-shape",
]);

export function repairBlueprintTree(blueprint: BuilderBlueprint): BuilderOperationResult<BuilderBlueprint> {
  const before = validateBlueprint(blueprint);
  const unsafeIssues = before.issues.filter((issue) => issue.severity === "error" && UNSAFE_REPAIR_CODES.has(issue.code));

  const safelyRepairable = before.issues.some((issue) =>
    issue.code === "missing-child" || issue.code === "duplicate-child-reference"
  );

  if (unsafeIssues.length > 0) {
    return operationFailure([
      ...unsafeIssues,
      validationIssue("unsafe-repair-blocked", "Blueprint contains structural issues that require explicit user or migration action."),
    ]);
  }

  if (!safelyRepairable) {
    return before.valid
      ? operationSuccess(structuredClone(blueprint), [])
      : operationFailure(before.issues);
  }

  const repaired = structuredClone(blueprint);
  const repairWarnings: BuilderValidationIssue[] = [];

  for (const [nodeId, node] of Object.entries(repaired.nodes)) {
    repaired.nodes[nodeId] = repairNodeChildren(node, repaired, repairWarnings);
  }

  const after = validateBlueprint(repaired);
  if (!after.valid) {
    return operationFailure(after.issues);
  }

  return operationSuccess(repaired, repairWarnings);
}

function repairNodeChildren(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  warnings: BuilderValidationIssue[]
): BuilderNode {
  const seen = new Set<string>();
  const children: string[] = [];

  for (const childId of node.children) {
    if (!blueprint.nodes[childId]) {
      warnings.push(validationIssue("missing-child-repaired", "Removed missing child reference.", {
        severity: "warning",
        nodeId: node.id,
      }));
      continue;
    }

    if (seen.has(childId)) {
      warnings.push(validationIssue("duplicate-child-reference-repaired", "Removed duplicate child reference.", {
        severity: "warning",
        nodeId: node.id,
      }));
      continue;
    }

    seen.add(childId);
    children.push(childId);
  }

  return {
    ...node,
    children,
  };
}
