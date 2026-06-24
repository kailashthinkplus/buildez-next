"use client";

import { useHoverStore } from "../store/useHoverStore";

export default function HoverOverlay() {
  const hoveredNodeId = useHoverStore((s) => s.hoveredNodeId);

  if (!hoveredNodeId) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <style>{`
        [data-node-id="${hoveredNodeId}"] {
          outline: 1px dashed #f59e0b !important;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
