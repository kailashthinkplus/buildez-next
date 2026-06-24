"use client";

import React from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";
import { usePointerStore } from "@/modules/builder/state/usePointerStore";

interface NodeWrapperProps {
  node: any;
  children: React.ReactNode;
}

export default function NodeWrapper({ node, children }: NodeWrapperProps) {
  const selectedId = useBlueprintStore((s) => s.selectedId);
  const setSelectedId = useBlueprintStore((s) => s.setSelectedId);
  const setHoveredId = useHighlightStore((s) => s.setHoveredId);

  const isSelected = selectedId === node.id;

  return (
    <div
      data-node-id={node.id}
      className="relative"
      onMouseEnter={() => setHoveredId(node.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
      style={{
        outline: isSelected ? "2px solid #3B82F6" : "none",
        outlineOffset: 1,
      }}
    >
      {children}
    </div>
  );
}
