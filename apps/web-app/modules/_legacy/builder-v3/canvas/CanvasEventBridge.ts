"use client";

import { useEffect, useRef } from "react";
import { useDndStore } from "../state/useDndStore";
import { useCanvasStore } from "../state/useCanvasStore";
import { useBlueprintStore } from "../state/useBlueprintStore";
import { useHighlightStore } from "../state/useHighlightStore";

/* ============================================================================
   CANVAS EVENT BRIDGE — V3 FINAL (ELEMENTOR-LEVEL)
   ------------------------------------------------------------
   RULES:
   - DnD store owns pointer truth
   - Canvas store is read-only helper
   - Hover disabled during drag
   - Clicks scoped to canvas only
============================================================================ */

export function CanvasEventBridge() {
  /* ---------------- DND (AUTHORITATIVE) ---------------- */
  const isDragging = useDndStore((s) => s.isDragging);
  const updateDragPosition = useDndStore((s) => s.updateDragPosition);

  /* ---------------- CANVAS ---------------- */
  const canvasRef = useCanvasStore((s) => s.canvasRef);

  /* ---------------- HIGHLIGHT / SELECTION ---------------- */
  const setHoveredNodeId = useHighlightStore((s) => s.setHoveredNodeId);
  const setSelectedNodeId = useBlueprintStore((s) => s.setSelectedNodeId);

  /* ---------------- INTERNAL ---------------- */
  const didDragRef = useRef(false);

  /* =========================================================================
     POINTER MOVE — SINGLE SOURCE OF TRUTH
  ========================================================================= */
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      /* --------------------------------------------------
         DnD pointer (authoritative)
      -------------------------------------------------- */
      if (isDragging) {
        didDragRef.current = true;
        updateDragPosition(x, y);
      }

      const canvas = canvasRef?.current;
      if (!canvas) return;

      /* --------------------------------------------------
         HOVER (DISABLED DURING DRAG)
      -------------------------------------------------- */
      if (!isDragging) {
        const hoveredEl = (e.target as HTMLElement | null)?.closest(
          "[data-node-id]"
        );
        const hoveredId =
          hoveredEl?.getAttribute("data-node-id") ?? null;
        setHoveredNodeId(hoveredId);
      }

      /* --------------------------------------------------
         AUTO SCROLL (ELEMENTOR STYLE)
      -------------------------------------------------- */
      if (!isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const EDGE = 80;
      const MAX = 28;

      let dy = 0;
      let dx = 0;

      if (y < rect.top + EDGE)
        dy = -Math.min(MAX, (rect.top + EDGE - y) * 0.35);
      else if (y > rect.bottom - EDGE)
        dy = Math.min(MAX, (y - (rect.bottom - EDGE)) * 0.35);

      if (x < rect.left + EDGE)
        dx = -Math.min(MAX, (rect.left + EDGE - x) * 0.35);
      else if (x > rect.right - EDGE)
        dx = Math.min(MAX, (x - (rect.right - EDGE)) * 0.35);

      if (dy) canvas.scrollTop += dy;
      if (dx) canvas.scrollLeft += dx;
    };

    window.addEventListener("pointermove", onPointerMove);
    return () =>
      window.removeEventListener("pointermove", onPointerMove);
  }, [isDragging, canvasRef, updateDragPosition, setHoveredNodeId]);

  /* =========================================================================
     CLICK — SELECTION (CANVAS ONLY)
  ========================================================================= */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }

      const canvas = canvasRef?.current;
      if (!canvas) return;

      if (!canvas.contains(e.target as Node)) return;

      const el = (e.target as HTMLElement | null)?.closest(
        "[data-node-id]"
      );
      const nodeId = el?.getAttribute("data-node-id") ?? null;

      if (nodeId) {
        setSelectedNodeId(nodeId);
      }
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [canvasRef, setSelectedNodeId]);

  return null;
}
