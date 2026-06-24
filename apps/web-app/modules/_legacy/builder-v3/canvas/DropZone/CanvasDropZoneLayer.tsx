"use client";

import React from "react";
import { useDndStore } from "@/modules/builder/state/useDndStore";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

export default function CanvasDropZoneLayer() {
  const { isDragging, dropTarget } = useDndStore();

  if (!isDragging || !dropTarget) return null;

  return (
    <div
      className="
        pointer-events-none absolute left-0 top-0 w-full h-full z-[999999]
      "
    >
      <div
        className="
          absolute left-0 right-0 h-[3px] bg-blue-500/90
          transition-all duration-75 ease-out
        "
        style={{
          top: dropTarget.y ?? 0,
        }}
      />
    </div>
  );
}
