import { indexRepositoryRecords } from "./indexer";
import type { WebsiteKnowledgeGraph } from "./graph";

const localGraph = indexRepositoryRecords().data;

/**
 * Returns the repository-backed local Knowledge Graph for a compatible industry.
 *
 * @example
 * const graph = getKnowledgeGraphForIndustry("healthcare");
 */
export function getKnowledgeGraphForIndustry(industry: string): WebsiteKnowledgeGraph | null {
  return localGraph.nodes.some((node) => node.compatibleIndustries.includes(industry)) ? localGraph : null;
}

/**
 * Lists available local Knowledge Graphs.
 *
 * @example
 * const graphs = listKnowledgeGraphs();
 */
export function listKnowledgeGraphs() {
  return [localGraph];
}
