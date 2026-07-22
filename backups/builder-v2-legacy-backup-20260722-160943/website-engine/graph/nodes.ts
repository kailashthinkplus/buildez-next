import type { EngineId, JsonValue, WebsiteArchetypeId } from "../sdk";
import type { RepositoryRecord, RepositoryRecordCategory } from "../repository";

/**
 * Typed node families used by the repository-backed Knowledge Graph.
 *
 * @example
 * const type: GraphNodeType = "archetype";
 */
export type GraphNodeType =
  | "business-family"
  | "industry"
  | "subindustry"
  | "archetype"
  | "pattern"
  | "component"
  | "design-language"
  | "tokens"
  | "composition-rule"
  | "constraint"
  | "asset-rule"
  | "qa-rule"
  | "repair-rule"
  | "fixture"
  | "example"
  | "anti-pattern"
  | "component-category";

/**
 * Local Knowledge Graph node derived from a repository record or synthetic category.
 *
 * @example
 * const id = node.id;
 */
export type GraphNode = Readonly<{
  id: EngineId | string;
  type: GraphNodeType;
  label: string;
  version: string;
  repositoryRecordId?: string;
  repositoryCategory?: RepositoryRecordCategory;
  compatibleIndustries: string[];
  compatibleArchetypes: WebsiteArchetypeId[];
  tags: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * Converts a repository record into a graph node.
 *
 * @example
 * const node = createGraphNodeFromRecord(record);
 */
export function createGraphNodeFromRecord(record: RepositoryRecord): GraphNode {
  return Object.freeze({
    id: record.id,
    type: record.category,
    label: record.title,
    version: record.version,
    repositoryRecordId: String(record.id),
    repositoryCategory: record.category,
    compatibleIndustries: [...record.compatibleIndustries],
    compatibleArchetypes: [...record.compatibleArchetypes],
    tags: [...record.tags],
    metadata: {
      status: record.status,
      description: record.description,
      provenanceSource: record.provenance.source,
      qualityConfidence: record.quality.confidence,
    },
  });
}
