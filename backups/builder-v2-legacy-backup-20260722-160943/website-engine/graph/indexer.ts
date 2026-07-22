import { createEngineResult, type EngineResult, type WebsiteArchetypeId } from "../sdk";
import {
  REPOSITORY_RECORDS,
  STARTER_INDUSTRIES,
  type RepositoryRecord,
  type RepositoryRecordCategory,
} from "../repository";
import { createGraphEdge, type GraphEdge, type GraphRelationship } from "./edges";
import { createWebsiteKnowledgeGraph, type WebsiteKnowledgeGraph } from "./graph";
import { createGraphNodeFromRecord, type GraphNode } from "./nodes";

const ruleCategories: Array<[RepositoryRecordCategory, GraphRelationship]> = [
  ["constraint", "requires"],
  ["asset-rule", "needsAsset"],
  ["qa-rule", "satisfies"],
  ["anti-pattern", "forbids"],
];

function intersects(left: readonly string[], right: readonly string[]) {
  return left.some((item) => right.includes(item));
}

function archetypeValue(record: RepositoryRecord) {
  return typeof record.payload.archetype === "string" ? record.payload.archetype : undefined;
}

function edgeId(from: string, relationship: GraphRelationship, to: string) {
  return `edge.${from}.${relationship}.${to}`;
}

function addEdge(edges: Map<string, GraphEdge>, from: string, to: string, relationship: GraphRelationship, sourceRecordIds = [from, to]) {
  const id = edgeId(from, relationship, to);
  if (from === to || edges.has(id)) return;
  edges.set(
    id,
    createGraphEdge(from, to, relationship, {
      id,
      sourceRecordIds,
      metadata: { localOnly: true },
    })
  );
}

function recordsByCategory(records: readonly RepositoryRecord[], category: RepositoryRecordCategory) {
  return records.filter((record) => record.category === category);
}

/**
 * Builds a local Website Knowledge Graph from repository records only.
 *
 * @example
 * const graph = buildKnowledgeGraph(REPOSITORY_RECORDS);
 */
export function buildKnowledgeGraph(records: readonly RepositoryRecord[] = REPOSITORY_RECORDS): WebsiteKnowledgeGraph {
  const nodes: GraphNode[] = records.map(createGraphNodeFromRecord);
  const edges = new Map<string, GraphEdge>();
  const families = recordsByCategory(records, "business-family");
  const industries = recordsByCategory(records, "industry");
  const subindustries = recordsByCategory(records, "subindustry");
  const archetypes = recordsByCategory(records, "archetype");
  const patterns = recordsByCategory(records, "pattern");
  const components = recordsByCategory(records, "component");

  for (const industry of industries) {
    const family = typeof industry.payload.businessFamily === "string" ? industry.payload.businessFamily : industry.compatibleIndustries[0];
    const familyId = `business-family.${family}`;
    if (families.some((record) => record.id === familyId)) {
      addEdge(edges, String(industry.id), familyId, "inheritsFrom");
      addEdge(edges, familyId, String(industry.id), "supports");
    }
  }

  for (const subindustry of subindustries) {
    const parentIndustry = industries.find((industry) => intersects(industry.compatibleIndustries, subindustry.compatibleIndustries));
    if (parentIndustry) {
      addEdge(edges, String(subindustry.id), String(parentIndustry.id), "inheritsFrom");
      addEdge(edges, String(parentIndustry.id), String(subindustry.id), "supports");
    }
  }

  for (const source of [...industries, ...subindustries]) {
    for (const archetype of archetypes) {
      if (!intersects(source.compatibleIndustries, archetype.compatibleIndustries)) continue;
      addEdge(edges, String(source.id), String(archetype.id), "supports");
      addEdge(edges, String(archetype.id), String(source.id), "compatibleWith");
    }
  }

  for (const archetype of archetypes) {
    const archetypeId = archetypeValue(archetype);
    for (const pattern of patterns) {
      if (!archetypeId || !pattern.compatibleArchetypes.includes(archetypeId as WebsiteArchetypeId)) continue;
      if (!intersects(archetype.compatibleIndustries, pattern.compatibleIndustries)) continue;
      addEdge(edges, String(archetype.id), String(pattern.id), "requires");
    }
  }

  for (const pattern of patterns) {
    for (const component of components) {
      if (!intersects(pattern.compatibleIndustries, component.compatibleIndustries)) continue;
      if (!intersects(pattern.compatibleArchetypes, component.compatibleArchetypes)) continue;
      addEdge(edges, String(pattern.id), String(component.id), "compatibleWith");
      addEdge(edges, String(component.id), String(pattern.id), "mapsToNode");
    }
  }

  for (const [category, relationship] of ruleCategories) {
    const rules = recordsByCategory(records, category);
    for (const source of [...industries, ...subindustries]) {
      for (const rule of rules) {
        if (!intersects(source.compatibleIndustries, rule.compatibleIndustries)) continue;
        addEdge(edges, String(source.id), String(rule.id), relationship);
      }
    }
    for (const archetype of archetypes) {
      const archetypeId = archetypeValue(archetype);
      for (const rule of rules) {
        if (!archetypeId || !rule.compatibleArchetypes.includes(archetypeId as WebsiteArchetypeId)) continue;
        if (!intersects(archetype.compatibleIndustries, rule.compatibleIndustries)) continue;
        addEdge(edges, String(archetype.id), String(rule.id), relationship);
      }
    }
  }

  return createWebsiteKnowledgeGraph(nodes, [...edges.values()], {
    source: "repository",
    localOnly: true,
    starterIndustries: [...STARTER_INDUSTRIES],
    recordCount: records.length,
  });
}

const defaultGraph = buildKnowledgeGraph(REPOSITORY_RECORDS);
const defaultNodeRegistry = new Map(defaultGraph.nodes.map((node) => [String(node.id), node]));

/**
 * Indexes repository records into the default local graph.
 *
 * @example
 * const result = indexRepositoryRecords();
 */
export function indexRepositoryRecords(): EngineResult<WebsiteKnowledgeGraph> {
  return createEngineResult({
    module: "graph",
    stage: "index",
    data: defaultGraph,
    metadata: {
      localOnly: true,
      nodeCount: defaultGraph.nodes.length,
      edgeCount: defaultGraph.edges.length,
    },
  });
}

/**
 * Gets one graph node from the default local graph.
 *
 * @example
 * const node = getGraphNode("archetype.lead_generation").data;
 */
export function getGraphNode(id: string): EngineResult<GraphNode | null> {
  return createEngineResult({
    module: "graph",
    stage: "get-node",
    data: defaultNodeRegistry.get(id) ?? null,
    metadata: { id },
  });
}

/**
 * Lists graph nodes from the default local graph.
 *
 * @example
 * const industries = listGraphNodes("industry").data;
 */
export function listGraphNodes(type?: GraphNode["type"]): EngineResult<GraphNode[]> {
  const nodes = type ? defaultGraph.nodes.filter((node) => node.type === type) : defaultGraph.nodes;
  return createEngineResult({
    module: "graph",
    stage: "list-nodes",
    data: nodes,
    metadata: { type: type ?? null, resultCount: nodes.length },
  });
}

/**
 * Lists graph edges from the default local graph.
 *
 * @example
 * const edges = listGraphEdges("requires").data;
 */
export function listGraphEdges(relationship?: GraphRelationship): EngineResult<GraphEdge[]> {
  const edges = relationship ? defaultGraph.edges.filter((edge) => edge.relationship === relationship) : defaultGraph.edges;
  return createEngineResult({
    module: "graph",
    stage: "list-edges",
    data: edges,
    metadata: { relationship: relationship ?? null, resultCount: edges.length },
  });
}
