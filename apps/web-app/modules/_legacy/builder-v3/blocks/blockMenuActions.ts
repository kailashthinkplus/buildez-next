// -------------------------------------------------------------
// blockMenuActions.ts (V3 FINAL)
// -------------------------------------------------------------
// Actions used by Left Sidebar Block Menu + Inline "Add" Buttons
// -------------------------------------------------------------

import { NodeType } from "@/modules/builder/blueprint/types";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

export function insertBlockAfter(targetId: string, block: NodeType) {
  useBlueprintStore
    .getState()
    .insertBlockAfter(targetId, block);
}

export function insertBlockBefore(targetId: string, block: NodeType) {
  useBlueprintStore
    .getState()
    .insertBlockBefore(targetId, block);
}

export function insertSection(section: NodeType) {
  useBlueprintStore.getState().insertSection(section);
}

export function addBlockInside(parentId: string, block: NodeType) {
  useBlueprintStore.getState().addBlock(parentId, block);
}
