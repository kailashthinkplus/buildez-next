// -------------------------------------------------------------
// computeDropTarget.ts — V3 FREEFORM MODE
// -------------------------------------------------------------
import { BlueprintNode } from "@/modules/builder/blueprint/types";

export interface DropTarget {
  parentId: string;
  index: number;
}

export function computeDropTarget(
  parent: BlueprintNode,
  index: number
): DropTarget {
  if (!parent) {
    console.warn("computeDropTarget: No parent node found");
    return { parentId: "root", index: 0 };
  }

  const safeIndex = Math.max(0, index);

  return {
    parentId: parent.id,
    index: safeIndex,
  };
}
