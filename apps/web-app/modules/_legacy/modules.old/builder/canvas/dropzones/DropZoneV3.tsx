"use client";

import React from "react";
import { useDnDStore } from "@/modules/builder/dnd/useDnDStore";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

export default function DropZoneV3({
  parentId,
  index,
  position = "after",
  height = 14,
}) {
  const {
    draggingNode,
    dragType,
    dropTarget,
    setDropTarget,
    clearDropTarget,
    isDragging,
  } = useDnDStore();

  const addNode = useBlueprintStore((s) => s.addNode);
  const insertBefore = useBlueprintStore((s) => s.insertBefore);
  const insertAfter = useBlueprintStore((s) => s.insertAfter);
  const insertInside = useBlueprintStore((s) => s.insertInside);

  const isActive =
    dropTarget?.parentId === parentId &&
    dropTarget?.index === index &&
    dropTarget?.position === position;

  function handleEnter(e) {
    e.preventDefault();
    if (!isDragging) return;

    setDropTarget({
      parentId,
      index,
      position,
    });
  }

  function handleLeave(e) {
    e.preventDefault();
    if (!isDragging) return;
    clearDropTarget();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!isDragging) return;

    const node = draggingNode;
    if (!node) return;

    if (position === "inside") {
      insertInside(parentId, node);
    } else if (position === "before") {
      insertBefore(dropTarget.targetId, node);
    } else if (position === "after") {
      insertAfter(dropTarget.targetId, node);
    }

    clearDropTarget();
  }

  return (
    <div
      data-dropzone
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleEnter}
      onDragLeave={handleLeave}
      onDrop={handleDrop}
      className={`
        transition-all
        w-full
        ${isActive ? "bg-blue-500/40" : "bg-transparent"}
      `}
      style={{
        height: isActive ? height + 6 : height,
        borderTop: isActive ? "2px solid #3b82f6" : "2px dashed transparent",
      }}
    />
  );
}
