// apps/web-app/modules/builder/dnd/FreeformPositioningEngine.ts
"use client";

/**
 * --------------------------------------------------------------
 * FreeformPositioningEngine.ts — BuildEZ V3 (Final)
 * --------------------------------------------------------------
 * Features:
 * ✔ Absolute positioning
 * ✔ Translate X/Y from drag
 * ✔ Zoom + scroll aware
 * ✔ Writes layout.left / layout.top / layout.position
 * ✔ Works with pointerEngine + CanvasStore
 */

import { pointerEngine, computeArtboardCoords } from "./pointerEngine";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

class FreeformEngineCore {
  isActive = false;
  targetId: string | null = null;

  startX = 0;
  startY = 0;

  origLeft = 0;
  origTop = 0;

  start(nodeId: string, e: PointerEvent) {
    const pos = computeArtboardCoords(e.clientX, e.clientY);
    this.startX = pos.x;
    this.startY = pos.y;

    this.targetId = nodeId;
    this.isActive = true;

    const rect = useCanvasStore.getState().getNodeRect(nodeId);
    if (rect) {
      this.origLeft = rect.x;
      this.origTop = rect.y;
    }

    pointerEngine.startGlobalPointerCapture({
      onMove: this.onMove,
      onUp: this.onUp,
    });
  }

  onMove = (e: PointerEvent) => {
    if (!this.isActive || !this.targetId) return;

    const pos = computeArtboardCoords(e.clientX, e.clientY);
    const dx = pos.x - this.startX;
    const dy = pos.y - this.startY;

    useBlueprintStore
      .getState()
      .updateLayout(this.targetId, {
        position: "absolute",
        left: `${this.origLeft + dx}px`,
        top: `${this.origTop + dy}px`,
      });

    useCanvasStore.getState().measureNode(this.targetId);
  };

  onUp = () => {
    this.isActive = false;
    this.targetId = null;
  };
}

export const FreeformPositioningEngine = new FreeformEngineCore();
