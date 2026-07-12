import type { BuilderNode, NodeType } from "../../types/blueprint";

let counter = 0;

export function createDeterministicNodeId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function resetDeterministicNodeIds(): void {
  counter = 0;
}

export function createTestBuilderNode(
  type: NodeType,
  parentId: string | null,
  overrides: Partial<BuilderNode> = {}
): BuilderNode {
  return {
    id: overrides.id ?? createDeterministicNodeId(type),
    type,
    ...(overrides.name !== undefined ? { name: overrides.name } : {}),
    parentId,
    children: overrides.children ?? [],
    props: overrides.props ?? {},
    style: overrides.style ?? {},
    ...(overrides.locked !== undefined ? { locked: overrides.locked } : {}),
    ...(overrides.hidden !== undefined ? { hidden: overrides.hidden } : {}),
  };
}

export function cloneTestNode(node: BuilderNode): BuilderNode {
  return structuredClone(node);
}
