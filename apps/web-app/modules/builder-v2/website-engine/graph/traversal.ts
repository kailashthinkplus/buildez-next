import { createEngineResult, type EngineResult } from "../sdk";
import { STARTER_INDUSTRIES } from "../repository";
import type { GraphEdge } from "./edges";
import type { GraphNode, GraphNodeType } from "./nodes";
import type { GraphPath, GraphTraversalQuery, GraphTraversalResult, WebsiteKnowledgeGraph } from "./graph";
import { indexRepositoryRecords } from "./indexer";

function graph() {
  return indexRepositoryRecords().data;
}

function nodeMap(input: WebsiteKnowledgeGraph) {
  return new Map(input.nodes.map((node) => [String(node.id), node]));
}

function pathMatchesTarget(path: GraphPath, query: GraphTraversalQuery, nodes: Map<string, GraphNode>) {
  const current = path.nodeIds[path.nodeIds.length - 1];
  const currentNode = nodes.get(current);
  if (query.to && current !== query.to) return false;
  if (query.targetType && currentNode?.type !== query.targetType) return false;
  if (!query.to && !query.targetType) return path.nodeIds.length > 1;
  return true;
}

function connectedEdges(input: WebsiteKnowledgeGraph, nodeId: string, query: GraphTraversalQuery) {
  return input.edges.filter((edge) => {
    if (query.relationship && edge.relationship !== query.relationship) return false;
    if (edge.from === nodeId) return true;
    return Boolean(query.includeReverse && edge.to === nodeId);
  });
}

function nextNode(edge: GraphEdge, nodeId: string) {
  return edge.from === nodeId ? String(edge.to) : String(edge.from);
}

/**
 * Traverses the local graph using deterministic breadth-first search.
 *
 * @example
 * const result = traverseGraph({ from: "business-family.education", targetType: "pattern" });
 */
export function traverseGraph(query: GraphTraversalQuery): EngineResult<GraphTraversalResult> {
  const input = graph();
  const nodes = nodeMap(input);
  const maxDepth = query.maxDepth ?? 4;
  const queue: GraphPath[] = [{ nodeIds: [query.from], edgeIds: [], relationships: [] }];
  const paths: GraphPath[] = [];

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) continue;
    const current = path.nodeIds[path.nodeIds.length - 1];
    if (path.edgeIds.length > 0 && pathMatchesTarget(path, query, nodes)) {
      paths.push(Object.freeze(path));
    }
    if (path.edgeIds.length >= maxDepth) continue;
    for (const edge of connectedEdges(input, current, query)) {
      const target = nextNode(edge, current);
      if (path.nodeIds.includes(target)) continue;
      queue.push({
        nodeIds: [...path.nodeIds, target],
        edgeIds: [...path.edgeIds, String(edge.id)],
        relationships: [...path.relationships, edge.relationship],
      });
    }
  }

  const edgeIds = new Set(paths.flatMap((path) => path.edgeIds));
  const nodeIds = new Set(paths.flatMap((path) => path.nodeIds));
  const resultEdges = input.edges.filter((edge) => edgeIds.has(String(edge.id)));
  const resultNodes = input.nodes.filter((node) => nodeIds.has(String(node.id)));

  return createEngineResult({
    module: "graph",
    stage: "traverse",
    data: {
      query,
      paths,
      nodes: resultNodes,
      edges: resultEdges,
    },
    metadata: { pathCount: paths.length, localOnly: true },
  });
}

function uniqueNodesFromPaths(paths: readonly GraphPath[], type: GraphNodeType) {
  const input = graph();
  const ids = new Set(paths.flatMap((path) => path.nodeIds));
  return input.nodes.filter((node) => ids.has(String(node.id)) && node.type === type);
}

/**
 * Finds archetypes compatible with a business family or industry node.
 *
 * @example
 * const archetypes = findCompatibleArchetypes("business-family.healthcare").data;
 */
export function findCompatibleArchetypes(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "archetype", maxDepth: 3 });
  return createEngineResult({ module: "graph", stage: "find-compatible-archetypes", data: uniqueNodesFromPaths(result.data.paths, "archetype") });
}

/**
 * Finds patterns required by a compatible archetype path.
 *
 * @example
 * const patterns = findRequiredPatterns("business-family.real_estate").data;
 */
export function findRequiredPatterns(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "pattern", maxDepth: 4 });
  return createEngineResult({ module: "graph", stage: "find-required-patterns", data: uniqueNodesFromPaths(result.data.paths, "pattern") });
}

/**
 * Finds anti-pattern records forbidden for a business family or industry.
 *
 * @example
 * const forbidden = findForbiddenPatterns("business-family.automotive").data;
 */
export function findForbiddenPatterns(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "anti-pattern", maxDepth: 4 });
  return createEngineResult({ module: "graph", stage: "find-forbidden-patterns", data: uniqueNodesFromPaths(result.data.paths, "anti-pattern") });
}

/**
 * Finds asset-rule nodes for a business family or industry.
 *
 * @example
 * const assetNeeds = findAssetNeeds("business-family.food_and_beverage").data;
 */
export function findAssetNeeds(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "asset-rule", maxDepth: 4 });
  return createEngineResult({ module: "graph", stage: "find-asset-needs", data: uniqueNodesFromPaths(result.data.paths, "asset-rule") });
}

/**
 * Finds constraint nodes for a business family or industry.
 *
 * @example
 * const constraints = findConstraints("business-family.education").data;
 */
export function findConstraints(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "constraint", maxDepth: 4 });
  return createEngineResult({ module: "graph", stage: "find-constraints", data: uniqueNodesFromPaths(result.data.paths, "constraint") });
}

/**
 * Finds QA rule nodes for a business family or industry.
 *
 * @example
 * const qaRules = findQaRules("business-family.healthcare").data;
 */
export function findQaRules(from: string): EngineResult<GraphNode[]> {
  const result = traverseGraph({ from, targetType: "qa-rule", maxDepth: 4 });
  return createEngineResult({ module: "graph", stage: "find-qa-rules", data: uniqueNodesFromPaths(result.data.paths, "qa-rule") });
}

/**
 * Explains the first graph path between nodes in readable relationship order.
 *
 * @example
 * const explanation = explainGraphPath("business-family.real_estate", "pattern.project_showcase").data;
 */
export function explainGraphPath(from: string, to: string): EngineResult<string[]> {
  const result = traverseGraph({ from, to, maxDepth: 5 });
  const firstPath = result.data.paths[0];
  if (!firstPath) {
    return createEngineResult({ module: "graph", stage: "explain-path", data: [], metadata: { found: false } });
  }
  const explanations = firstPath.relationships.map((relationship, index) => {
    const source = firstPath.nodeIds[index];
    const target = firstPath.nodeIds[index + 1];
    return `${source} ${relationship} ${target}`;
  });
  return createEngineResult({ module: "graph", stage: "explain-path", data: explanations, metadata: { found: true } });
}

/**
 * Starter industry graph root ids used by validation and fixture checks.
 *
 * @example
 * const roots = STARTER_GRAPH_ROOT_IDS;
 */
export const STARTER_GRAPH_ROOT_IDS = Object.freeze(STARTER_INDUSTRIES.map((industry) => `business-family.${industry}`));
