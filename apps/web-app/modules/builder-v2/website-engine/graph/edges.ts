import type { EngineId, JsonValue } from "../sdk";
import { WEBSITE_GRAPH_VERSION_STRING } from "./version";

/**
 * Supported repository-backed graph relationship names.
 *
 * @example
 * const relationship: GraphRelationship = "requires";
 */
export type GraphRelationship =
  | "inheritsFrom"
  | "requires"
  | "supports"
  | "forbids"
  | "prefers"
  | "overrides"
  | "dependsOn"
  | "satisfies"
  | "conflictsWith"
  | "needsAsset"
  | "needsFact"
  | "convertsTo"
  | "mapsToNode"
  | "compatibleWith"
  | "incompatibleWith";

/**
 * Directed edge between two local Knowledge Graph nodes.
 *
 * @example
 * const sourceId = edge.from;
 */
export type GraphEdge = Readonly<{
  id: EngineId | string;
  from: EngineId | string;
  to: EngineId | string;
  relationship: GraphRelationship;
  version: string;
  weight: number;
  sourceRecordIds: string[];
  metadata: Record<string, JsonValue>;
}>;

/**
 * All valid graph relationship names.
 *
 * @example
 * const valid = GRAPH_RELATIONSHIPS.includes("supports");
 */
export const GRAPH_RELATIONSHIPS: readonly GraphRelationship[] = Object.freeze([
  "inheritsFrom",
  "requires",
  "supports",
  "forbids",
  "prefers",
  "overrides",
  "dependsOn",
  "satisfies",
  "conflictsWith",
  "needsAsset",
  "needsFact",
  "convertsTo",
  "mapsToNode",
  "compatibleWith",
  "incompatibleWith",
]);

/**
 * Creates an immutable graph edge.
 *
 * @example
 * const edge = createGraphEdge("industry.healthcare.clinic", "archetype.appointment", "supports");
 */
export function createGraphEdge(
  from: string,
  to: string,
  relationship: GraphRelationship,
  input: Partial<Pick<GraphEdge, "id" | "weight" | "sourceRecordIds" | "metadata">> = {}
): GraphEdge {
  return Object.freeze({
    id: input.id ?? `edge.${from}.${relationship}.${to}`,
    from,
    to,
    relationship,
    version: WEBSITE_GRAPH_VERSION_STRING,
    weight: input.weight ?? 1,
    sourceRecordIds: input.sourceRecordIds ?? [from, to],
    metadata: input.metadata ?? {},
  });
}
