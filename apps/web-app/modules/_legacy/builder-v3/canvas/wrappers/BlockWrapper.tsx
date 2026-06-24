"use client";

import React from "react";
import { BlueprintNode } from "@/modules/builder/blueprint/types";

/* STORES */
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";
import { useDndStore } from "@/modules/builder/state/useDndStore";

/* UI */
import BlockToolbar from "@/app/app/(builder)/[siteSlug]/[pageSlugWithId]/canvas/BlockToolbar";

/* UTILS */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ============================================================
   BlockWrapper — FINAL, SAFE VERSION
   RULES:
   - NO DropZone here
   - NO layout responsibility
   - Editor chrome only
============================================================ */
export default function BlockWrapper({
  node,
  children,
}: {
  node: BlueprintNode;
  children: React.ReactNode;
}) {
  if (!node?.id) return null;

  const selectedId = useBlueprintStore((s) => s.selectedNodeId);
  const setSelectedId = useBlueprintStore((s) => s.setSelectedNodeId);

  const hoveredNodeId = useCanvasStore((s) => s.hoveredNodeId);
  const setHoveredNodeId = useCanvasStore((s) => s.setHoveredNodeId);

  const isDragging = useDndStore((s) => s.isDragging);

  const isSelected = selectedId === node.id;
  const isHovered = hoveredNodeId === node.id;

  return (
    <div
      className={cn(
        "relative group p-0 m-0 min-h-[24px]",
        "transition-colors",

        // Elementor-style highlight
        isHovered && !isSelected && "outline outline-1 outline-sky-400/40",
        isSelected && "outline outline-2 outline-sky-500"
      )}
      data-node-id={node.id}
      data-node-type="block"
      data-selected={isSelected}
      onClick={(e) => {
        if (isDragging) return;
        e.stopPropagation();
        setSelectedId(node.id);
      }}
      onMouseEnter={() => !isDragging && setHoveredNodeId(node.id)}
      onMouseLeave={() => !isDragging && setHoveredNodeId(null)}
    >
      {/* BLOCK TOOLBAR */}
      {(isHovered || isSelected) && <BlockToolbar node={node} />}

      {/* PURE CONTENT */}
      <div className="relative z-10 pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
