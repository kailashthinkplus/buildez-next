import type { DesignGraph } from "./schema";

export type DesignGraphValidation = Readonly<{ valid: boolean; issues: readonly string[] }>;

export function validateDesignGraph(graph: DesignGraph): DesignGraphValidation {
  const issues: string[] = [];
  if (graph.version !== "0") issues.push("unsupported-version");
  if (!graph.nodes[graph.rootId] || graph.nodes[graph.rootId].type !== "page") issues.push("invalid-root");
  const visited = new Set<string>();
  const active = new Set<string>();
  function walk(id: string) {
    const node = graph.nodes[id];
    if (!node) { issues.push(`missing-node:${id}`); return; }
    if (active.has(id)) { issues.push(`cycle:${id}`); return; }
    if (visited.has(id)) return;
    visited.add(id); active.add(id);
    if (!node.provenance.sourceFile || node.provenance.line < 1 || node.provenance.column < 1 || !node.provenance.sourceElement) issues.push(`invalid-provenance:${id}`);
    for (const childId of node.children) {
      if (graph.nodes[childId]?.parentId !== id) issues.push(`parent-mismatch:${childId}`);
      walk(childId);
    }
    active.delete(id);
  }
  walk(graph.rootId);
  for (const id of Object.keys(graph.nodes)) if (!visited.has(id)) issues.push(`orphan:${id}`);
  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}
