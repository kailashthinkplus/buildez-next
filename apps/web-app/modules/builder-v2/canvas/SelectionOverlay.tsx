"use client";

import { useEffect, useState } from "react";
import { useSelectionStore } from "../store/useSelectionStore";
import SelectionToolbar from "./SelectionToolbar";
import type { SelectionToolbarProps } from "./SelectionToolbar";
import { getCanvasRelativeNodeRect, getCanvasScale } from "./canvasOverlayGeometry";

interface SelectionOverlayProps {
  selectionToolbarProps: SelectionToolbarProps;
  onResize?(nodeId: string, width: number, height: number): void;
}

type OverlayRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function SelectionOverlay({
  selectionToolbarProps,
  onResize,
}: SelectionOverlayProps) {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId);
  const [rect, setRect] = useState<OverlayRect | null>(null);

  useEffect(() => {
  if (!selectedNodeId) {
    return;
  }

  const update = () => {
    setRect(getCanvasRelativeNodeRect(selectedNodeId));
  };

  let frame = 0;

  const scheduleUpdate = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(update);
  };

  scheduleUpdate();
  const selectedElement = document.querySelector(
    `.builder-canvas-sandbox [data-node-id="${CSS.escape(selectedNodeId)}"]`
  );
  const observer = new ResizeObserver(scheduleUpdate);
  if (selectedElement) observer.observe(selectedElement);

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, true);

  return () => {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("resize", scheduleUpdate);
    window.removeEventListener("scroll", scheduleUpdate, true);
  };
}, [selectedNodeId]);

  if (!selectedNodeId || !rect) {
    return <SelectionToolbar {...selectionToolbarProps} />;
  }

  const beginResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    axis: "width" | "height" | "both"
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = rect;
    const canvas = document.querySelector(".builder-canvas-sandbox") as HTMLElement | null;
    const scale = canvas ? getCanvasScale(canvas) || 1 : 1;
    const ratio = start.width / Math.max(1, start.height);

    const move = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;
      let width = axis === "height" ? start.width : Math.max(24, start.width + dx);
      let height = axis === "width" ? start.height : Math.max(24, start.height + dy);
      if (axis === "both") {
        if (Math.abs(dx) >= Math.abs(dy)) height = width / ratio;
        else width = height * ratio;
      }
      setRect({ ...start, width, height });
    };

    const end = (endEvent: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      const dx = (endEvent.clientX - startX) / scale;
      const dy = (endEvent.clientY - startY) / scale;
      let width = axis === "height" ? start.width : Math.max(24, start.width + dx);
      let height = axis === "width" ? start.height : Math.max(24, start.height + dy);
      if (axis === "both") {
        if (Math.abs(dx) >= Math.abs(dy)) height = width / ratio;
        else width = height * ratio;
      }
      onResize?.(selectedNodeId, Math.round(width), Math.round(height));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  return (
    <>
      <div
        className="pointer-events-none absolute z-30 border-2 border-blue-400 shadow-[0_0_0_5px_rgba(59,130,246,0.14)]"
        style={{
          left: rect.left - 2,
          top: rect.top - 2,
          width: rect.width + 4,
          height: rect.height + 4,
        }}
      />

      <div
        className="pointer-events-none absolute z-30 border border-dashed border-blue-300/60"
        style={{
          left: rect.left - 7,
          top: rect.top - 7,
          width: rect.width + 14,
          height: rect.height + 14,
        }}
      />

      {onResize && (
        <>
          <button
            type="button"
            aria-label="Resize width"
            onPointerDown={(event) => beginResize(event, "width")}
            className="absolute z-40 h-3.5 w-2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full border border-white bg-blue-500 shadow"
            style={{ left: rect.left + rect.width, top: rect.top + rect.height / 2 }}
          />
          <button
            type="button"
            aria-label="Resize height"
            onPointerDown={(event) => beginResize(event, "height")}
            className="absolute z-40 h-2 w-3.5 -translate-x-1/2 translate-y-1/2 cursor-ns-resize rounded-full border border-white bg-blue-500 shadow"
            style={{ left: rect.left + rect.width / 2, top: rect.top + rect.height }}
          />
          <button
            type="button"
            aria-label="Resize proportionally"
            onPointerDown={(event) => beginResize(event, "both")}
            className="absolute z-40 h-2.5 w-2.5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-sm border border-white bg-blue-500 shadow"
            style={{ left: rect.left + rect.width, top: rect.top + rect.height }}
          />
        </>
      )}

      <SelectionToolbar {...selectionToolbarProps} />
    </>
  );
}
