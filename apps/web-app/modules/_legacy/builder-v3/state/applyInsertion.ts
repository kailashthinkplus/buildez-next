"use client";

import { nanoid } from "nanoid";
import { BlueprintNode, NodeType } from "@/modules/builder/blueprint/types";
import { createNode, getPreset } from "@/modules/builder/blueprint/registry";
import { computeDropTarget } from "@/modules/builder/canvas/DropZones/computeDropTarget";
import { useBlueprintStore } from "./useBlueprintStore";
import { useDndStore } from "./useDndStore";

/**
 * INSERTION PIPELINE
 * ------------------------------------------------------
 * Called when dragging a new block/section into the canvas.
 * - Creates the node from preset
 * - Inserts into correct parent/position
 * - Normalizes & snapshots history
 */

export function applyInsertion() {
  const blueprintStore = useBlueprintStore.getState();
  const dndStore = useDndStore.getState();

  const drag = dndStore.dragData;
  const hover = dndStore.hover;

  if (!drag || !hover) return;

  const result = computeDropTarget(drag, hover);
  if (!result.valid) return;

  const { parentId, index, position } = result;

  // 1) CREATE NODE FROM PRESET
  const preset = getPreset(drag.presetType!);
  const newNode = preset.create();
  newNode.id = nanoid();

  // 2) INSERT NODE
  blueprintStore.insertNode({
    parentId,
    index,
    node: newNode,
    position,
  });

  // 3) NORMALIZE BLUEPRINT
  blueprintStore.normalizeTree();

  // 4) SNAPSHOT HISTORY
  blueprintStore.snapshotHistory(`insert:${newNode.type}`);

  // 5) SELECT NEW NODE
  blueprintStore.setSelectedId(newNode.id);

  // 6) CLEANUP DND STATE
  dndStore.endDrag();
}
