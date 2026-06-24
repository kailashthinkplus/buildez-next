"use client";

import React from "react";
import { useDnDStore } from "@/modules/builder/dnd/useDnDStore";

export default function DragOverlay() {
  const { draggingNode, pointerY, isDragging } = useDnDStore();

  if (!isDragging || !draggingNode) return null;

  return (
    <div
      className="
        fixed left-1/2 -translate-x-1/2 pointer-events-none
        z-[99999] opacity-80
      "
      style={{
        top: pointerY - 20,
      }}
    >
      <div
        className="
          px-3 py-1 rounded-lg text-xs
          bg-blue-600/90 text-white shadow-lg
        "
      >
        {draggingNode.type}
      </div>
    </div>
  );
}
