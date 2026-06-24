"use client";

import { useState } from "react";

export default function HoverOverlay() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
