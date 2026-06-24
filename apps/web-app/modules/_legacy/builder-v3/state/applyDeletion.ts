// -------------------------------------------------------------
// applyDeletion.ts (V3 Final)
// -------------------------------------------------------------
// Pure reducer-style utility used by useBlueprintStore.
// Removes a node and all its children from the tree recursively.
// Zero side-effects. Safe for history stack + undo.
// -------------------------------------------------------------

import { BlueprintNode } from "@/modules/builder/blueprint/types";

export function applyDeletion(
  root: BlueprintNode,
  targetId: string
): BlueprintNode {
  if (!root) return root;

  // If root itself is target → return empty root (edge case)
  if (root.id === targetId) {
    return { ...root, children: [] };
  }

  // Recursive prune
  const prune = (node: BlueprintNode): BlueprintNode | null => {
    if (!node.children) return node;

    const filtered = node.children
      .map((child) => prune(child))
      .filter(Boolean) as BlueprintNode[];

    return { ...node, children: filtered };
  };

  return prune(root) as BlueprintNode;
}
