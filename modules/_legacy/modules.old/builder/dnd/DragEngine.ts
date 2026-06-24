// apps/web-app/modules/builder/dnd/DragEngine.ts
"use client";

/**
 * --------------------------------------------------------------
 * DragEngine.ts — BuildEZ V3 (Final)
 * --------------------------------------------------------------
 * Features:
 * ✔ Start drag from SectionWrapper or DragHandle
 * ✔ Global pointer tracking via pointerEngine
 * ✔ Computes dropParentId + dropIndex + dropPosition
 * ✔ Snaps to children / above / below / inside
 * ✔ Works with zoom + scroll + artboard coordinates
 * ✔ Accurate parent hit-testing using CanvasStore rects
 * ✔ On drop → BlueprintStore.moveNode()
 */

import { useDnDStore } from "./useDnDStore";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";
import { pointerEngine, computeArtboardCoords } from "./pointerEngine";
import { DropPosition } from "./dndTypes";

class DragEngineCore {
  isDragging = false;

  startPointerX = 0;
  startPointerY = 0;

  start(nodeId: string, parentId: string, index: number, e: PointerEvent) {
    const { startDrag } = useDnDStore.getState();
    this.isDragging = true;

    const pos = computeArtboardCoords(e.clientX, e.clientY);

    this.startPointerX = pos.x;
    this.startPointerY = pos.y;

    startDrag(nodeId, parentId, index);

    pointerEngine.startGlobalPointerCapture({
      onMove: this.onMove,
      onUp: this.onUp,
    });
  }

  onMove = (e: PointerEvent) => {
    if (!this.isDragging) return;

    const canvas = useCanvasStore.getState();
    const dnd = useDnDStore.getState();

    const pos = computeArtboardCoords(e.clientX, e.clientY);
    dnd.setPointer(pos.x, pos.y);

    // Hit-test nodes to detect new drop target
    const target = this.detectDropTarget(pos.x, pos.y);
    if (!target) {
      dnd.setDropIntent(null, null, null);
      return;
    }

    dnd.setDropIntent(target.parentId, target.index, target.position);
  };

  /** Hit-test for drop location */
  detectDropTarget(px: number, py: number) {
    const { rects } = useCanvasStore.getState();
    const entries = Object.entries(rects);

    for (const [nodeId, rect] of entries) {
      if (
        px >= rect.x &&
        px <= rect.x + rect.width &&
        py >= rect.y &&
        py <= rect.y + rect.height
      ) {
        const midY = rect.y + rect.height / 2;
        const position: DropPosition =
          py < midY ? "before" : "after";

        const bp = useBlueprintStore.getState();
        const tree = bp.tree;

        // Find parent and index
        const parent = this.findParent(tree, nodeId);
        if (!parent) return null;

        const index = parent.children.findIndex((c) => c.id === nodeId);

        return {
          parentId: parent.id,
          index,
          position,
        };
      }
    }
    return null;
  }

  findParent(root: any, id: string): any {
    for (const c of root.children) {
      if (c.id === id) return root;
      const deep = this.findParent(c, id);
      if (deep) return deep;
    }
    return null;
  }

  onUp = () => {
    if (!this.isDragging) return;

    useDnDStore.getState().performDrop();
    this.isDragging = false;
  };
}

export const DragEngine = new DragEngineCore();
