import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { expectedChildRelationshipLabel, isAllowedChildRelationship } from "./blueprintSchema";
import { buildValidationResult, validationIssue, type BuilderValidationIssue, type BuilderValidationResult } from "./validationResult";

export function validateNodeTree(blueprint: BuilderBlueprint): BuilderValidationResult {
  const issues: BuilderValidationIssue[] = [];
  const root = blueprint.nodes[blueprint.root];

  if (!root) {
    issues.push(validationIssue("missing-root", "Blueprint root id is missing from nodes.", { path: "root" }));
    return buildValidationResult(issues);
  }

  if (root.type !== "page") {
    issues.push(validationIssue("root-not-page", "Blueprint root node must be a page node.", { nodeId: root.id }));
  }

  if (root.parentId !== null) {
    issues.push(validationIssue("root-has-parent", "Root node must not have a parent.", { nodeId: root.id }));
  }

  const referencedChildren = new Map<string, string[]>();

  for (const [nodeId, node] of Object.entries(blueprint.nodes)) {
    validateNodeLinks(nodeId, node, blueprint, referencedChildren, issues);
  }

  for (const [childId, parentIds] of referencedChildren.entries()) {
    if (parentIds.length > 1) {
      issues.push(validationIssue("child-has-multiple-parents", "Child is referenced by more than one parent.", { nodeId: childId }));
    }
  }

  collectCycleIssues(blueprint, issues);
  collectReachabilityIssues(blueprint, issues);

  return buildValidationResult(issues);
}

function validateNodeLinks(
  nodeId: string,
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  referencedChildren: Map<string, string[]>,
  issues: BuilderValidationIssue[]
): void {
  if (node.id !== nodeId) {
    issues.push(validationIssue("node-id-mismatch", "Node map key does not match node id.", { nodeId }));
  }

  if (node.parentId !== null && !blueprint.nodes[node.parentId]) {
    issues.push(validationIssue("missing-parent", "Node parentId does not exist.", { nodeId }));
  }

  const seenChildren = new Set<string>();
  for (const childId of node.children) {
    if (seenChildren.has(childId)) {
      issues.push(validationIssue("duplicate-child-reference", "Node children contains the same child more than once.", { nodeId }));
      continue;
    }
    seenChildren.add(childId);

    const child = blueprint.nodes[childId];
    if (!child) {
      issues.push(validationIssue("missing-child", "Node child id does not exist.", { nodeId }));
      continue;
    }

    const parents = referencedChildren.get(childId) ?? [];
    parents.push(node.id);
    referencedChildren.set(childId, parents);

    if (child.parentId !== node.id) {
      issues.push(validationIssue("child-parent-mismatch", "Child parentId does not point back to parent.", { nodeId: child.id }));
    }

    if (!isAllowedChildRelationship(node.type, child.type)) {
      issues.push(validationIssue(
        "invalid-child-relationship",
        [
          `Parent: ${node.type}`,
          `Child: ${child.type}`,
          `Expected: ${expectedChildRelationshipLabel(node.type)}`,
          `Received: ${child.type}`,
          "Insertion: BuilderShell/BlocksPanel -> InsertNodeCommand",
        ].join("\n"),
        {
          nodeId: child.id,
          path: `nodes.${node.id}.children.${node.children.indexOf(child.id)}`,
        }
      ));
    }
  }
}

function collectCycleIssues(blueprint: BuilderBlueprint, issues: BuilderValidationIssue[]): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (nodeId: string): void => {
    if (visiting.has(nodeId)) {
      issues.push(validationIssue("cycle-detected", "Node tree contains a cycle.", { nodeId }));
      return;
    }
    if (visited.has(nodeId)) return;

    const node = blueprint.nodes[nodeId];
    if (!node) return;

    visiting.add(nodeId);
    for (const childId of node.children) {
      visit(childId);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  visit(blueprint.root);

  for (const nodeId of Object.keys(blueprint.nodes)) {
    visit(nodeId);
  }
}

function collectReachabilityIssues(blueprint: BuilderBlueprint, issues: BuilderValidationIssue[]): void {
  const visited = new Set<string>();
  const queue = [blueprint.root];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) continue;
    const node = blueprint.nodes[nodeId];
    if (!node) continue;

    visited.add(nodeId);
    queue.push(...node.children);
  }

  for (const [nodeId, node] of Object.entries(blueprint.nodes)) {
    if (nodeId !== blueprint.root && !visited.has(nodeId)) {
      issues.push(validationIssue("orphan-node", "Node is not reachable from the root page.", { nodeId }));
    }

    if (nodeId !== blueprint.root && node.parentId === null) {
      issues.push(validationIssue("non-root-without-parent", "Only the root page may have a null parentId.", { nodeId }));
    }
  }
}
