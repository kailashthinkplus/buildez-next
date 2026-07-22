import type { EngineId, JsonValue } from "../sdk";
import type { GraphEdge } from "./edges";
import type { GraphNode, GraphNodeType } from "./nodes";
import { WEBSITE_GRAPH_VERSION_STRING } from "./version";

/**
 * Serializable repository-backed Website Knowledge Graph.
 *
 * @example
 * const count = graph.nodes.length;
 */
export type WebsiteKnowledgeGraph = Readonly<{
  id: EngineId | string;
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Query options for local graph traversal.
 *
 * @example
 * const query: GraphTraversalQuery = { from: "business-family.healthcare", maxDepth: 3 };
 */
export type GraphTraversalQuery = Readonly<{
  from: string;
  to?: string;
  relationship?: GraphEdge["relationship"];
  targetType?: GraphNodeType;
  maxDepth?: number;
  includeReverse?: boolean;
}>;

/**
 * Ordered list of nodes and edges found during traversal.
 *
 * @example
 * const firstNode = path.nodeIds[0];
 */
export type GraphPath = Readonly<{
  nodeIds: string[];
  edgeIds: string[];
  relationships: GraphEdge["relationship"][];
}>;

/**
 * Result returned by deterministic local graph traversal.
 *
 * @example
 * const paths = result.paths;
 */
export type GraphTraversalResult = Readonly<{
  query: GraphTraversalQuery;
  paths: GraphPath[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}>;

/**
 * Validation result for graph shape and coverage.
 *
 * @example
 * const valid = validation.valid;
 */
export type GraphValidationResult = Readonly<{
  valid: boolean;
  issues: GraphValidationIssue[];
  graph?: WebsiteKnowledgeGraph;
}>;

/**
 * One local graph validation issue.
 *
 * @example
 * const code = issue.code;
 */
export type GraphValidationIssue = Readonly<{
  path: string;
  code: string;
  message: string;
}>;

/**
 * Creates an immutable Website Knowledge Graph.
 *
 * @example
 * const graph = createWebsiteKnowledgeGraph(nodes, edges);
 */
export function createWebsiteKnowledgeGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  metadata: Record<string, JsonValue> = {}
): WebsiteKnowledgeGraph {
  return Object.freeze({
    id: "website-knowledge-graph.local",
    version: WEBSITE_GRAPH_VERSION_STRING,
    nodes,
    edges,
    metadata,
  });
}
