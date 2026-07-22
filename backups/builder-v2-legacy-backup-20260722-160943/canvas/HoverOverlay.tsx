"use client";

import { useEffect, useState } from "react";
import { useHoverStore } from "../store/useHoverStore";
import { useSelectionStore } from "../store/useSelectionStore";
import { getCanvasRelativeNodeRect } from "./canvasOverlayGeometry";

type OverlayRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function HoverOverlay() {
  const hoveredNodeId = useHoverStore((s) => s.hoveredNodeId);
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId);
  const [rect, setRect] = useState<OverlayRect | null>(null);

  useEffect(() => {
  if (!hoveredNodeId || hoveredNodeId === selectedNodeId) {
    setRect(null);
    return;
  }

  const update = () => {
    setRect(getCanvasRelativeNodeRect(hoveredNodeId));
  };

  let frame = 0;

  const scheduleUpdate = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(update);
  };

  scheduleUpdate();
  const hoveredElement = document.querySelector(
    `.builder-canvas-sandbox [data-node-id="${CSS.escape(hoveredNodeId)}"]`
  );
  const observer = new ResizeObserver(scheduleUpdate);
  if (hoveredElement) observer.observe(hoveredElement);

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, true);

  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("resize", scheduleUpdate);
    window.removeEventListener("scroll", scheduleUpdate, true);
  };
}, [hoveredNodeId, selectedNodeId]);

  if (!hoveredNodeId || hoveredNodeId === selectedNodeId || !rect) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 border border-sky-300/70 bg-sky-400/[0.03]"
      style={{
        left: rect.left - 1,
        top: rect.top - 1,
        width: rect.width + 2,
        height: rect.height + 2,
      }}
    />
  );
}
