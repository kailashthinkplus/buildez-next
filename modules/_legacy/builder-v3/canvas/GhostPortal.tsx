"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useDndStore } from "../state/useDndStore";
import { useBlueprintStore } from "../state/useBlueprintStore";
import GhostRenderer from "@/app/app/(builder)/[siteSlug]/[pageSlugWithId]/canvas/GhostRenderer";

export default function GhostPortal() {
  const {
    isDragging,
    draggedNode,
    dragNodeId,
    pointerX,
    pointerY,
  } = useDndStore();

  const findNode = useBlueprintStore((s) => s.findNode);

  if (!isDragging) return null;

  // --------------------------------------------------
  // Determine ghost node source
  // --------------------------------------------------
  let ghostNode = draggedNode;

  if (!ghostNode && dragNodeId) {
    const hit = findNode(dragNodeId);
    if (hit?.node) {
      ghostNode = hit.node;
    }
  }

  if (!ghostNode) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pointerX + 8,
        top: pointerY + 8,
        pointerEvents: "none",
        zIndex: 9999,
        transform: "scale(0.95)",
        opacity: 0.85,
      }}
    >
      <GhostRenderer node={ghostNode} />
    </div>,
    document.body
  );
}
