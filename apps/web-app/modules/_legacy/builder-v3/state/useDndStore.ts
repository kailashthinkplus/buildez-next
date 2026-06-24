"use client";

import { create } from "zustand";
import { useBlueprintStore } from "./useBlueprintStore";
import { NodeType } from "@/modules/builder/blueprint/types";

/* ============================================================================
   TYPES
============================================================================ */

export type DropIntent = "before" | "after" | "inside";

interface DropTarget {
  parentId: string;
  index: number;
  intent: DropIntent;
}

interface DndState {
  /* -------------------------------------------------
     STATE
  ------------------------------------------------- */
  isDragging: boolean;

  /** Existing node drag (canvas → canvas) */
  dragNodeId: string | null;

  /** New node drag (palette → canvas) */
  draggedType: NodeType | null;

  dropTarget: DropTarget | null;

  /** Pointer (SOURCE OF TRUTH FOR DND) */
  pointerX: number;
  pointerY: number;

  /* -------------------------------------------------
     API
  ------------------------------------------------- */
  startDraggingNode: (nodeId: string) => void;
  startDraggingPalette: (type: NodeType) => void;

  updateDragPosition: (x: number, y: number) => void;
  setDropTarget: (t: DropTarget | null) => void;

  commitDrop: () => void;
  stopDragging: () => void;
}

/* ============================================================================
   STORE — V3 CANONICAL (ELEMENTOR-LEVEL)
============================================================================ */

export const useDndStore = create<DndState>((set, get) => ({
  /* -------------------------------------------------
     INITIAL STATE
  ------------------------------------------------- */
  isDragging: false,

  dragNodeId: null,
  draggedType: null,

  dropTarget: null,

  pointerX: 0,
  pointerY: 0,

  /* -------------------------------------------------
     CANVAS → CANVAS (EXISTING NODE)
  ------------------------------------------------- */
  startDraggingNode: (nodeId) => {
    if (!nodeId) return;

    set({
      isDragging: true,
      dragNodeId: nodeId,
      draggedType: null,
      dropTarget: null,
    });
  },

  /* -------------------------------------------------
     PALETTE → CANVAS (NEW NODE)
  ------------------------------------------------- */
  startDraggingPalette: (type) => {
    set({
      isDragging: true,
      dragNodeId: null,
      draggedType: type,
      dropTarget: null,
    });
  },

  /* -------------------------------------------------
     POINTER (DnD OWNED)
  ------------------------------------------------- */
  updateDragPosition: (x, y) =>
    set({
      pointerX: x,
      pointerY: y,
    }),

  /* -------------------------------------------------
     DROP TARGET (FROM OVERLAY)
  ------------------------------------------------- */
  setDropTarget: (t) => {
    set({ dropTarget: t });
  },

  /* -------------------------------------------------
     COMMIT DROP — SINGLE AUTHORITY
  ------------------------------------------------- */
  commitDrop: () => {
    const {
      isDragging,
      dragNodeId,
      draggedType,
      dropTarget,
    } = get();

    if (!isDragging) return;

    const blueprint = useBlueprintStore.getState();
    const pageId = blueprint.currentPageId;

    if (!pageId) {
      get().stopDragging();
      return;
    }

    const page = blueprint.pages[pageId].shadow.page;

    /* --------------------------------------------
       SAFE FALLBACK (EMPTY CANVAS)
    -------------------------------------------- */
    const fallbackTarget: DropTarget = {
      parentId: page.id,
      index: page.children.length,
      intent: "inside",
    };

    const target = dropTarget ?? fallbackTarget;

    const insertIndex =
      target.intent === "before"
        ? target.index
        : target.intent === "after"
        ? target.index + 1
        : target.index;

    /* --------------------------------------------
       PALETTE → CANVAS
    -------------------------------------------- */
    if (draggedType) {
      blueprint.handleDrop({
        kind: "INSERT_NEW",
        nodeType: draggedType,
        parentId: target.parentId,
        index: insertIndex,
        source: "palette",
      });

      get().stopDragging();
      return;
    }

    /* --------------------------------------------
       CANVAS → CANVAS
    -------------------------------------------- */
    if (dragNodeId) {
      blueprint.handleDrop({
        kind: "INSERT_EXISTING",
        nodeId: dragNodeId,
        parentId: target.parentId,
        index: insertIndex,
      });

      get().stopDragging();
      return;
    }

    get().stopDragging();
  },

  /* -------------------------------------------------
     CLEANUP (HARD RESET)
  ------------------------------------------------- */
  stopDragging: () => {
    set({
      isDragging: false,
      dragNodeId: null,
      draggedType: null,
      dropTarget: null,
    });
  },
}));
