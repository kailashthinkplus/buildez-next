"use client";

import React from "react";
import { useDndStore } from "@/modules/builder/state/useDndStore";

export default function HighlightLayer({ rectMap }) {
  const { hoverTargetId, hoverPosition } = useDndStore();

  if (!hoverTargetId || !hoverPosition) return null;
  const rect = rectMap.get(hoverTargetId);
  if (!rect) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 9999,
    left: rect.left,
    width: rect.width,
    background:
      hoverPosition === "inside"
        ? "rgba(0,255,0,0.15)"
        : "rgba(0,150,255,0.25)",
  };

  if (hoverPosition === "before") {
    style.top = rect.top - 2;
    style.height = 4;
  } else if (hoverPosition === "after") {
    style.top = rect.bottom - 2;
    style.height = 4;
  } else {
    style.top = rect.top;
    style.height = rect.height;
  }

  return <div style={style} />;
}
