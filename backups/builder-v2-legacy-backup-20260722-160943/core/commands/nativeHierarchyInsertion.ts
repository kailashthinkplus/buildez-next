import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import { SECTION_LIKE_NODE_TYPES } from "../validation/blueprintSchema";

export type NativeInsertionStep = Readonly<{
  parentId: string;
  node: BuilderNode;
  index?: number;
}>;

export type NativeInsertionPlan = Readonly<{
  steps: NativeInsertionStep[];
  selectNodeId: string;
}>;

type CreateNode = (type: NodeType, parentId: string | null) => BuilderNode;

const SECTION_LIKE_TYPES = new Set<NodeType>(SECTION_LIKE_NODE_TYPES);

export function buildNativeInsertionPlan(
  blueprint: BuilderBlueprint,
  type: NodeType,
  requestedParentId: string | undefined,
  createNode: CreateNode,
  index?: number
): NativeInsertionPlan | null {
  const requestedParent = requestedParentId ? blueprint.nodes[requestedParentId] : null;
  const context = requestedParent ?? blueprint.nodes[blueprint.root];

  if (!context) return null;

  if (isPageChildType(type)) {
    const page = findNearestNodeOfType(blueprint, context.id, "page") ?? blueprint.nodes[blueprint.root];
    const node = createNode(type, page.id);
    return {
      steps: [{ parentId: page.id, node, index: page.id === requestedParentId ? index : undefined }],
      selectNodeId: node.id,
    };
  }

  if (type === "container") {
    const section = findNearestNodeOfType(blueprint, context.id, "section");
    if (section) {
      const container = createNode("container", section.id);
      const column = createNode("column", container.id);
      return {
        steps: [
          { parentId: section.id, node: container, index: section.id === requestedParentId ? index : undefined },
          { parentId: container.id, node: column },
        ],
        selectNodeId: container.id,
      };
    }

    const page = blueprint.nodes[blueprint.root];
    const sectionNode = createNode("section", page.id);
    const container = createNode("container", sectionNode.id);
    const column = createNode("column", container.id);
    return {
      steps: [
        { parentId: page.id, node: sectionNode, index: page.id === requestedParentId ? index : undefined },
        { parentId: sectionNode.id, node: container },
        { parentId: container.id, node: column },
      ],
      selectNodeId: container.id,
    };
  }

  if (type === "column") {
    const existingContainer =
      context.type === "column" && context.parentId
        ? blueprint.nodes[context.parentId]
        : findNearestNodeOfType(blueprint, context.id, "container");

    if (existingContainer?.type === "container") {
      const column = createNode("column", existingContainer.id);
      return {
        steps: [{
          parentId: existingContainer.id,
          node: column,
          index: existingContainer.id === requestedParentId ? index : undefined,
        }],
        selectNodeId: column.id,
      };
    }

    const section = findNearestNodeOfType(blueprint, context.id, "section");
    if (section) {
      const container = createNode("container", section.id);
      const column = createNode("column", container.id);
      return {
        steps: [
          { parentId: section.id, node: container, index: section.id === requestedParentId ? index : undefined },
          { parentId: container.id, node: column },
        ],
        selectNodeId: column.id,
      };
    }

    const page = blueprint.nodes[blueprint.root];
    const sectionNode = createNode("section", page.id);
    const container = createNode("container", sectionNode.id);
    const column = createNode("column", container.id);
    return {
      steps: [
        { parentId: page.id, node: sectionNode, index: page.id === requestedParentId ? index : undefined },
        { parentId: sectionNode.id, node: container },
        { parentId: container.id, node: column },
      ],
      selectNodeId: column.id,
    };
  }

  // An explicit container/column drop must honor the visible target. Both
  // relationships are valid in the production schema; synthesizing a sibling
  // container made the canvas indicator disagree with the resulting tree.
  if (context.type === "container" || context.type === "column") {
    const widget = createNode(type, context.id);
    return {
      steps: [{ parentId: context.id, node: widget, index }],
      selectNodeId: widget.id,
    };
  }

  const column = findInsertionColumn(blueprint, context.id);
  if (column) {
    const widget = createNode(type, column.id);
    return {
      steps: [{
        parentId: column.id,
        node: widget,
        index: column.id === requestedParentId ? index : undefined,
      }],
      selectNodeId: widget.id,
    };
  }

  const section = findNearestNodeOfType(blueprint, context.id, "section");
  if (section) {
    const container = createNode("container", section.id);
    const newColumn = createNode("column", container.id);
    const widget = createNode(type, newColumn.id);
    return {
      steps: [
        { parentId: section.id, node: container, index: section.id === requestedParentId ? index : undefined },
        { parentId: container.id, node: newColumn },
        { parentId: newColumn.id, node: widget },
      ],
      selectNodeId: widget.id,
    };
  }

  const page = blueprint.nodes[blueprint.root];
  const sectionNode = createNode("section", page.id);
  const container = createNode("container", sectionNode.id);
  const newColumn = createNode("column", container.id);
  const widget = createNode(type, newColumn.id);
  return {
    steps: [
      { parentId: page.id, node: sectionNode, index: page.id === requestedParentId ? index : undefined },
      { parentId: sectionNode.id, node: container },
      { parentId: container.id, node: newColumn },
      { parentId: newColumn.id, node: widget },
    ],
    selectNodeId: widget.id,
  };
}

export function isPageChildType(type: NodeType): boolean {
  return type === "section" || SECTION_LIKE_TYPES.has(type);
}

function findInsertionColumn(
  blueprint: BuilderBlueprint,
  nodeId: string
): BuilderNode | null {
  const node = blueprint.nodes[nodeId];
  if (!node) return null;
  if (node.type === "column") return node;

  if (node.type === "container") {
    const childColumnId = node.children.find((childId) => blueprint.nodes[childId]?.type === "column");
    return childColumnId ? blueprint.nodes[childColumnId] : null;
  }

  if (node.parentId) {
    return findInsertionColumn(blueprint, node.parentId);
  }

  return null;
}

function findNearestNodeOfType(
  blueprint: BuilderBlueprint,
  nodeId: string,
  type: NodeType
): BuilderNode | null {
  let cursor: string | null = nodeId;

  while (cursor) {
    const node = blueprint.nodes[cursor];
    if (!node) return null;
    if (node.type === type) return node;
    cursor = node.parentId;
  }

  return null;
}
