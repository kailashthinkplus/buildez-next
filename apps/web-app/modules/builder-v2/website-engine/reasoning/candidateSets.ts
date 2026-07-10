import { indexRepositoryRecords } from "../graph";
import {
  REPOSITORY_RECORDS,
  type RepositoryRecord,
  type RepositoryRecordCategory,
} from "../repository";
import type { GraphEdge, GraphNode } from "../graph";
import type {
  CandidateSet,
  ReasoningCandidate,
  ReasoningCandidateCategory,
  ReasoningInput,
} from "./reasoning";
import { createReasoningCandidate } from "./reasoning";

const categoryMap: Partial<Record<RepositoryRecordCategory, ReasoningCandidateCategory>> = {
  "business-family": "Business Families",
  industry: "Industries",
  subindustry: "Subindustries",
  archetype: "Website Archetypes",
  pattern: "Patterns",
  component: "Component Families",
  "design-language": "Design Languages",
  "composition-rule": "Composition Strategies",
  "asset-rule": "Asset Strategies",
  "qa-rule": "SEO Strategies",
  "repair-rule": "Repair Strategies",
};

function graphNodeFor(record: RepositoryRecord, nodes: readonly GraphNode[]) {
  return nodes.find((node) => node.repositoryRecordId === record.id || node.id === record.id);
}

function fromRepositoryRecord(record: RepositoryRecord, nodes: readonly GraphNode[]): ReasoningCandidate | null {
  const category = categoryMap[record.category];
  if (!category) return null;
  const node = graphNodeFor(record, nodes);
  return createReasoningCandidate({
    id: `candidate.${record.id}`,
    category,
    label: record.title,
    source: "repository",
    repositoryRecordId: String(record.id),
    graphNodeId: node ? String(node.id) : undefined,
    constraintRuleIds: record.category === "constraint" ? [`repository.${record.id}`] : [],
    compatibleIndustries: [...record.compatibleIndustries],
    compatibleArchetypes: [...record.compatibleArchetypes],
    tags: [...record.tags],
    metadata: {
      status: record.status,
      repositoryConfidence: record.quality.confidence,
      provenanceSource: record.provenance.source,
    },
  });
}

function intelligenceCandidates(input: ReasoningInput): ReasoningCandidate[] {
  const cta = [
    ...(input.businessIntelligence?.conversionGoals ?? []),
    ...(input.contentStrategy?.ctaStrategy ?? []),
  ].map((strategy, index) =>
    createReasoningCandidate({
      id: `candidate.cta.${index}.${strategy.toLowerCase().replaceAll(" ", "_")}`,
      category: "CTA Strategies",
      label: strategy,
      source: "intelligence",
      constraintRuleIds: [],
      compatibleIndustries: input.businessIntelligence?.businessFamily ? [input.businessIntelligence.businessFamily] : [],
      compatibleArchetypes: input.websiteSpec?.archetype ? [String(input.websiteSpec.archetype)] : [],
      tags: ["cta", strategy],
      metadata: { source: "business-and-content-intelligence" },
    })
  );
  const seo = (input.contentStrategy?.seoContentStrategy ?? []).map((strategy, index) =>
    createReasoningCandidate({
      id: `candidate.seo.${index}.${strategy.toLowerCase().replaceAll(" ", "_")}`,
      category: "SEO Strategies",
      label: strategy,
      source: "intelligence",
      constraintRuleIds: [],
      compatibleIndustries: input.businessIntelligence?.businessFamily ? [input.businessIntelligence.businessFamily] : [],
      compatibleArchetypes: input.websiteSpec?.archetype ? [String(input.websiteSpec.archetype)] : [],
      tags: ["seo", strategy],
      metadata: { source: "content-intelligence" },
    })
  );
  return [...cta, ...seo];
}

function defaultGraph() {
  return indexRepositoryRecords().data;
}

function uniqueCandidates(candidates: ReasoningCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const id = String(candidate.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * Builds deterministic candidate sets from repository, graph, and intelligence inputs.
 *
 * @example
 * const sets = buildCandidateSet(input);
 */
export function buildCandidateSet(input: ReasoningInput = {}): CandidateSet[] {
  const graph = input.graphNodes && input.graphEdges
    ? { nodes: input.graphNodes, edges: input.graphEdges }
    : defaultGraph();
  const records = input.repositoryRecords ?? [...REPOSITORY_RECORDS];
  const candidates = uniqueCandidates([
    ...records.flatMap((record) => {
      const candidate = fromRepositoryRecord(record, graph.nodes);
      return candidate ? [candidate] : [];
    }),
    ...intelligenceCandidates(input),
  ]);
  const grouped = new Map<ReasoningCandidateCategory, ReasoningCandidate[]>();
  for (const candidate of candidates) {
    grouped.set(candidate.category, [...(grouped.get(candidate.category) ?? []), candidate]);
  }
  return [...grouped.entries()].map(([category, group]) =>
    Object.freeze({ category, candidates: group })
  );
}

/**
 * Flattens candidate sets.
 *
 * @example
 * const candidates = flattenCandidateSets(sets);
 */
export function flattenCandidateSets(sets: readonly CandidateSet[]): ReasoningCandidate[] {
  return sets.flatMap((set) => set.candidates);
}

/**
 * Returns graph evidence used for candidate scoring.
 *
 * @example
 * const edges = getReasoningGraphEvidence(input).edges;
 */
export function getReasoningGraphEvidence(input: ReasoningInput): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const graph = input.graphNodes && input.graphEdges
    ? { nodes: input.graphNodes, edges: input.graphEdges }
    : defaultGraph();
  return { nodes: graph.nodes, edges: graph.edges };
}
