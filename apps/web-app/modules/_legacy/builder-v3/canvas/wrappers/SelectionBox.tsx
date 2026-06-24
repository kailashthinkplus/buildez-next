"use client";

import React from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

/* ============================================================
   SELECTION BOX (SAFE V3)
============================================================ */

export default function SelectionBox() {
  const selectedId = useBlueprintStore((s) => s.selectedNodeId);

  const rectMap = useCanvasStore((s) => s.rectMap);

  /* -----------------------------------------------------------
     SAFETY GUARDS (CRITICAL)
  ----------------------------------------------------------- */

  if (!selectedId) return null;

  if (!rectMap || typeof rectMap.get !== "function") {
    // Rects not registered yet (first render / fast click)
    return null;
  }

  const rect = rectMap.get(selectedId);
  if (!rect) return null;

  /* -----------------------------------------------------------
     POSITIONING
  ----------------------------------------------------------- */
  const style: React.CSSProperties = {
    position: "absolute",
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    border: "2px solid #3B82F6",
    borderRadius: 8,
    pointerEvents: "none",
    zIndex: 50,
    boxSizing: "border-box",
  };

  return <div className="selection-box" style={style} />;
}
