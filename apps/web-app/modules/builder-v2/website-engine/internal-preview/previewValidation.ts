import type { BuilderBlueprint } from "../../types/blueprint";

export type PreviewValidationResult = Readonly<{
  valid: boolean;
  issues: readonly string[];
  nodeCount: number;
}>;

export function validatePreviewBlueprint(blueprint: BuilderBlueprint | undefined): PreviewValidationResult {
  const issues: string[] = [];
  if (!blueprint) return Object.freeze({ valid: false, issues: ["Canonical Blueprint is missing."], nodeCount: 0 });
  const nodes = Object.values(blueprint.nodes);
  if (!blueprint.nodes[blueprint.root]) issues.push("Canonical Blueprint root does not exist in nodes.");
  for (const node of nodes) {
    if (node.parentId !== null && !blueprint.nodes[node.parentId]) issues.push(`Node ${node.id} has a missing parent.`);
    for (const childId of node.children) if (!blueprint.nodes[childId]) issues.push(`Node ${node.id} has a missing child ${childId}.`);
  }
  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues), nodeCount: nodes.length });
}

