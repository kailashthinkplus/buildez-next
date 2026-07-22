import type { BuilderNode, NodeType } from "../../types/blueprint";
import type { MapperInput } from "./mapperInput";

/**
 * Ordered native node creation plan. It is not executed in Phase 31.
 *
 * @example
 * const nodes = buildNodeMappingPlan(input);
 */
export type NodeMappingPlan = Readonly<{
  id: string;
  order: number;
  nodeId: string;
  nodeType: NodeType;
  parentId: string | null;
  childIds: string[];
  nativeNode: BuilderNode;
  nativeWidgetTypeIntent: NodeType;
  editable: boolean;
  sourceIntentId: string;
  insertCommandPlanned: true;
  executed: false;
}>;

/**
 * Builds ordered node mapping metadata from native node intents.
 *
 * @example
 * const nodes = buildNodeMappingPlan(input);
 */
export function buildNodeMappingPlan(input: MapperInput): NodeMappingPlan[] {
  const intents = input.nativeNodeIntents ?? input.builderBlueprint?.nativeNodeIntents ?? input.builderBlueprintResult?.nativeNodeIntents ?? [];
  return intents.map((intent, order) => Object.freeze({
    id: `node-map.${intent.node.id}`,
    order,
    nodeId: intent.node.id,
    nodeType: intent.node.type,
    parentId: intent.node.parentId,
    childIds: intent.node.children,
    nativeNode: intent.node,
    nativeWidgetTypeIntent: intent.node.type,
    editable: true,
    sourceIntentId: intent.sourceWidgetId,
    insertCommandPlanned: true as const,
    executed: false as const,
  }));
}
