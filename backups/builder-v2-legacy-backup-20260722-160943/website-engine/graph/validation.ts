import type { ValidationIssue } from "../sdk";
import { STARTER_INDUSTRIES } from "../repository";
import { GRAPH_RELATIONSHIPS } from "./edges";
import type { GraphValidationResult, WebsiteKnowledgeGraph } from "./graph";
import type { GraphNodeType } from "./nodes";
import { traverseGraph } from "./traversal";

const fakeClaimTerms = ["award-winning", "guaranteed results", "certified by", "officially authorized", "100%", "number one", "#1"];
const requiredStarterTargets: GraphNodeType[] = ["archetype", "pattern", "constraint", "asset-rule", "qa-rule", "anti-pattern"];

function issue(path: string, message: string, code = "INVALID_GRAPH"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function containsFakeClaimLanguage(graph: WebsiteKnowledgeGraph) {
  const searchable = JSON.stringify({
    nodes: graph.nodes.map((node) => ({ label: node.label, metadata: node.metadata })),
    edges: graph.edges.map((edge) => edge.metadata),
  }).toLowerCase();
  return fakeClaimTerms.some((term) => searchable.includes(term));
}

function hasCircularInheritance(graph: WebsiteKnowledgeGraph) {
  const inheritance = graph.edges.filter((edge) => edge.relationship === "inheritsFrom");
  const bySource = new Map<string, string[]>();
  for (const edge of inheritance) {
    const values = bySource.get(String(edge.from)) ?? [];
    values.push(String(edge.to));
    bySource.set(String(edge.from), values);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const next of bySource.get(nodeId) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };
  return [...bySource.keys()].some(visit);
}

/**
 * Validates graph structure, relationship names, references, inheritance, and starter coverage.
 *
 * @example
 * const validation = validateKnowledgeGraph(graph);
 */
export function validateKnowledgeGraph(graph: WebsiteKnowledgeGraph): GraphValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => String(node.id)));

  graph.nodes.forEach((node, index) => {
    if (!node.id) issues.push(issue(`nodes.${index}.id`, "Graph node id is required.", "REQUIRED"));
    if (!node.type) issues.push(issue(`nodes.${index}.type`, "Graph node type is required.", "REQUIRED"));
    if (!node.version) issues.push(issue(`nodes.${index}.version`, "Graph node version is required.", "REQUIRED"));
  });

  graph.edges.forEach((edge, index) => {
    if (!nodeIds.has(String(edge.from))) issues.push(issue(`edges.${index}.from`, "Graph edge source must reference an existing node.", "UNKNOWN_NODE"));
    if (!nodeIds.has(String(edge.to))) issues.push(issue(`edges.${index}.to`, "Graph edge target must reference an existing node.", "UNKNOWN_NODE"));
    if (!GRAPH_RELATIONSHIPS.includes(edge.relationship)) issues.push(issue(`edges.${index}.relationship`, "Graph edge relationship is invalid.", "INVALID_RELATIONSHIP"));
  });

  if (hasCircularInheritance(graph)) {
    issues.push(issue("edges.inheritsFrom", "Graph must not contain circular inheritance.", "CIRCULAR_INHERITANCE"));
  }

  const universalRoots = graph.edges.filter((edge) => edge.relationship === "supports" && String(edge.from).startsWith("industry."));
  const rootCounts = new Map<string, number>();
  for (const edge of universalRoots) {
    rootCounts.set(String(edge.from), (rootCounts.get(String(edge.from)) ?? 0) + 1);
  }
  for (const [root, count] of rootCounts) {
    if (count > graph.nodes.filter((node) => node.type === "archetype").length) {
      issues.push(issue(root, "No single industry may be treated as a universal graph root.", "UNIVERSAL_INDUSTRY_ROOT"));
    }
  }

  for (const industry of STARTER_INDUSTRIES) {
    const root = `business-family.${industry}`;
    for (const targetType of requiredStarterTargets) {
      const result = traverseGraph({ from: root, targetType, maxDepth: 5 });
      if (result.data.paths.length === 0) {
        issues.push(issue(root, `Starter industry needs at least one path to ${targetType}.`, "MISSING_STARTER_PATH"));
      }
    }
  }

  if (containsFakeClaimLanguage(graph)) {
    issues.push(issue("graph", "Graph appears to contain fake-claim language.", "FAKE_CLAIM_LANGUAGE"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues,
    graph: issues.length === 0 ? graph : undefined,
  });
}
