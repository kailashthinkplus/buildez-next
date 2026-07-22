import type { BuilderNode, NodeType } from "../../types/blueprint";
import type { NativeBuilderMappingPlan } from "./mapperPlan";

const supportedTypes = new Set<NodeType>(["page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"]);

/**
 * Creates native BuilderNode objects from a validated mapping plan without inserting them anywhere.
 *
 * @example
 * const nodes = createNativeBuilderNodesFromPlan(plan);
 */
export function createNativeBuilderNodesFromPlan(plan: NativeBuilderMappingPlan): BuilderNode[] {
  return plan.nodeCreationPlan.map((nodePlan) => {
    if (!supportedTypes.has(nodePlan.nodeType)) {
      throw new Error(`Unsupported native widget type: ${nodePlan.nodeType}`);
    }
    return {
      ...nodePlan.nativeNode,
      type: nodePlan.nodeType,
      parentId: nodePlan.parentId,
      children: [...nodePlan.childIds],
      props: { ...nodePlan.nativeNode.props },
      style: { ...nodePlan.nativeNode.style },
      locked: nodePlan.nativeNode.locked ?? false,
      hidden: nodePlan.nativeNode.hidden ?? false,
    };
  });
}
