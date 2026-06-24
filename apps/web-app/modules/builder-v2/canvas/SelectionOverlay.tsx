"use client";

import { useSelectionStore } from "../store/useSelectionStore";

export default function SelectionOverlay() {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId);

  if (!selectedNodeId) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <style>{`
        [data-node-id="${selectedNodeId}"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
