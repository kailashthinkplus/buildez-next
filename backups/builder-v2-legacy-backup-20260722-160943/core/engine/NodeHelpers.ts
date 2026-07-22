import { BuilderBlueprint } from "../../types/blueprint";

export function getNode(
  blueprint: BuilderBlueprint,
  id: string
) {
  return blueprint.nodes[id];
}

export function getChildren(
  blueprint: BuilderBlueprint,
  id: string
) {

  return blueprint.nodes[id].children.map(
    childId => blueprint.nodes[childId]
  );

}

export function getParent(
  blueprint: BuilderBlueprint,
  id: string
) {

  const node = blueprint.nodes[id];

  if (!node.parentId) return null;

  return blueprint.nodes[node.parentId];

}