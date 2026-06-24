"use client";

import { computeDropTarget } from "@/modules/builder/canvas/DropZones/computeDropTarget";
import { useBlueprintStore } from "./useBlueprintStore";
import { useDndStore } from "./useDndStore";

/**
 * MOVE PIPELINE
 * ------------------------------------------------------
 * Called when dragging an existing node to reorder.
 */

export function applyMove() {
  const blueprintStore = useBlueprintStore.getState();
  const dndStore = useDndStore.getState();

  const drag = dndStore.dragData;
  const hover = dndStore.hover;

  if (!drag || !drag.nodeId || !hover) return;

  const result = computeDropTarget(drag, hover);
  if (!result.valid) return;

  const { parentId, index, position } = result;

  // Prevent moving node into itself or its descendants
  if (blueprintStore.isAncestor(drag.nodeId, parentId)) {
    return;
  }

  // MOVE THE NODE
  blueprintStore.moveNode({
    nodeId: drag.nodeId,
    newParentId: parentId,
    newIndex: index,
    position,
  });

  // NORMALIZE TREE
  blueprintStore.normalizeTree();

  // SNAPSHOT HISTORY
  blueprintStore.snapshotHistory(`move:${drag.nodeId}`);

  // KEEP IT SELECTED
  blueprintStore.setSelectedId(drag.nodeId);

  // END DRAGGING
  dndStore.endDrag();
}
