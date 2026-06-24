"use client";

import { useEffect, useRef } from "react";
import { useDndStore } from "@/modules/builder/dnd/useDnDStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

/**
 * STEP 15 — Smart Auto-Scroll + Depth-Aware Scroll
 *
 * - Reacts to dragPosition (x,y)
 * - Computes scroll speed based on:
 *      • distance from edges
 *      • container depth
 *      • hovered node size
 * - Applies scroll via requestAnimationFrame
 */

export function useSmartAutoScroll() {
  const { dragPosition, isDragging, dragOverNodeId } = useDndStore();
  const { canvasRef } = useCanvasStore();

  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging || !dragPosition) return;

    const canvas = canvasRef?.current;
    if (!canvas) return;

    let running = true;

    function loop() {
      if (!running || !isDragging || !dragPosition) return;

      const { x, y } = dragPosition;

      const viewHeight = window.innerHeight;
      const margin = 80; // activation zone

      let speed = 0;

      // ----------------------------------------------------
      // BASIC EDGE DETECTION
      // ----------------------------------------------------
      if (y < margin) {
        speed = -((margin - y) * 0.35);
      } else if (y > viewHeight - margin) {
        speed = (y - (viewHeight - margin)) * 0.35;
      }

      // ----------------------------------------------------
      // DEPTH AWARE BOOST (nested containers)
      // Deeper nodes scroll faster
      // ----------------------------------------------------
      if (dragOverNodeId) {
        const depth = dragOverNodeId.split("_").length; // simple depth heuristic
        speed *= 1 + depth * 0.15;
      }

      // ----------------------------------------------------
      // SIZE AWARE (hovering big sections → speed up)
      // ----------------------------------------------------
      if (dragOverNodeId) {
        const el = document.querySelector(`[data-node-id="${dragOverNodeId}"]`) as HTMLElement;
        if (el) {
          const rect = el.getBoundingClientRect();
          const heightFactor = Math.min(rect.height / 400, 2); // max 2x speed
          speed *= heightFactor;
        }
      }

      // ----------------------------------------------------
      // APPLY SCROLL
      // ----------------------------------------------------
      if (speed !== 0) {
        window.scrollBy({
          top: speed,
          behavior: "auto",
        });
      }

      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isDragging, dragPosition, dragOverNodeId, canvasRef]);
}
