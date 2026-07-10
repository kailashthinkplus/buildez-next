import { createEngineResult, type EngineResult } from "../sdk";
import { traverseGraph, type GraphTraversalQuery } from ".";

export type QueryGraphInput = {
  query?: string;
  recordIds?: string[];
  traversal?: GraphTraversalQuery;
};

export type GraphQueryResult = {
  nodes: unknown[];
  edges: unknown[];
};

/**
 * Backward-compatible graph query wrapper over local deterministic traversal.
 *
 * @example
 * const result = queryGraph({ traversal: { from: "business-family.healthcare", targetType: "archetype" } });
 */
export function queryGraph(input: QueryGraphInput = {}): EngineResult<GraphQueryResult> {
  if (!input.traversal) {
    return createEngineResult({
      module: "graph",
      stage: "query",
      data: { nodes: [], edges: [] },
      metadata: { localOnly: true, emptyQuery: true },
    });
  }
  const result = traverseGraph(input.traversal);
  return createEngineResult({
    module: "graph",
    stage: "query",
    data: { nodes: result.data.nodes, edges: result.data.edges },
    metadata: { localOnly: true, pathCount: result.data.paths.length },
  });
}
