"use client";

import React from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";
import { useDnDStore } from "@/modules/builder/dnd/useDnDStore";

import DropZone from "../dropzones/DropZoneV3";

export default function SectionWrapper({
  node,
  parentId,
  index,
  children,
}: {
  node: any;
  parentId: string;
  index: number;
  children: React.ReactNode;
}) {
  const selectedId = useBlueprintStore((s) => s.selectedId);
  const setSelectedId = useBlueprintStore((s) => s.setSelectedId);

  const hoveredId = useHighlightStore((s) => s.hoveredId);
  const setHoveredId = useHighlightStore((s) => s.setHoveredId);

  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id;

  return (
    <div className="relative w-full">
      {/* BEFORE */}
      <DropZone parentId={parentId} index={index} position="before" />

      <div
        data-section-id={node.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(node.id);
        }}
        onMouseEnter={() => setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
        className="relative w-full transition-all"
        style={{
          outline: isSelected
            ? "2px solid #3B82F6"
            : isHovered
            ? "1px dashed rgba(59,130,246,0.5)"
            : "none",
          outlineOffset: 2,
          borderRadius: "8px",
        }}
      >
        {children}
      </div>

      {/* AFTER */}
      <DropZone parentId={parentId} index={index} position="after" />
    </div>
  );
}
