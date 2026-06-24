// -------------------------------------------------------------
// nodeIndex.ts
// Pure blueprint index builder (NO React, NO Zustand)
// -------------------------------------------------------------

import { BlueprintNode } from "./types";

export interface BlueprintIndexEntry {
  id: string;
  parentId: string | null;
  index: number;
  path: string;
}

export type BlueprintIndex = Record<string, BlueprintIndexEntry>;

export function buildNodeIndex(root: BlueprintNode): BlueprintIndex {
  const index: BlueprintIndex = {};

  function walk(
    node: BlueprintNode,
    parent: BlueprintNode | null,
    path: string
  ) {
    index[node.id] = {
      id: node.id,
      parentId: parent ? parent.id : null,
      index: parent ? parent.children.indexOf(node) : 0,
      path,
    };

    if (Array.isArray(node.children)) {
      node.children.forEach((child, i) => {
        walk(child, node, `${path}.children.${i}`);
      });
    }
  }

  walk(root, null, "root");
  return index;
}
