// RFC-003 / RFC-004 — Full DnD Engine Store (Elementor-Plus Ready)

import { create } from "zustand";
import { DropPosition } from "./dndTypes";

export type DnDMode = "none" | "drag" | "resize" | "freeform";

interface DnDState {
  /* -------------------------------------------------
     GLOBAL MODE FLAG
  ------------------------------------------------- */
  mode: DnDMode;

  /* -------------------------------------------------
     DRAGGING BLOCKS / SECTIONS
  ------------------------------------------------- */
  draggingId: string | null;
  sourceParentId: string | null;
  sourceIndex: number | null;

  dropParentId: string | null;
  dropIndex: number | null;
  dropPosition: DropPosition | null;

  pointerX: number;
  pointerY: number;
  isDragging: boolean;
  dragStartTime: number | null;

  /* Drag actions */
  startDrag: (id: string, parentId: string, index: number) => void;
  updateDragPointer: (x: number, y: number) => void;
  setDropIntent: (parentId: string | null, index: number | null, pos: DropPosition | null) => void;
  performDrop: () => void;

  /* -------------------------------------------------
     RESIZE STATE
  ------------------------------------------------- */
  resizeId: string | null;
  resizeDirection: "left" | "right" | "top" | "bottom" | null;
  resizeStartX: number;
  resizeStartY: number;
  resizeStartRect: { width: number; height: number; x: number; y: number } | null;
  isResizing: boolean;

  /* Resize actions */
  startResize: (
    id: string,
    direction: "left" | "right" | "top" | "bottom",
    startX: number,
    startY: number,
    rect: { width: number; height: number; x: number; y: number }
  ) => void;

  updateResize: (clientX: number, clientY: number) => void;
  commitResize: () => void;

  /* -------------------------------------------------
     FREEFORM (ABSOLUTE POSITIONING)
  ------------------------------------------------- */
  freeformId: string | null;
  freeformStartX: number;
  freeformStartY: number;
  freeformOriginalLeft: number;
  freeformOriginalTop: number;
  isFreeforming: boolean;

  /* Freeform actions */
  startFreeform: (
    id: string,
    startX: number,
    startY: number,
    currentLeft: number,
    currentTop: number
  ) => void;

  updateFreeform: (clientX: number, clientY: number) => void;
  commitFreeform: () => void;

  /* -------------------------------------------------
     RESET
  ------------------------------------------------- */
  reset: () => void;
}

export const useDnDStore = create<DnDState>((set, get) => ({
  /* -------------------------------------------------
     INIT STATE
  ------------------------------------------------- */
  mode: "none",

  draggingId: null,
  sourceParentId: null,
  sourceIndex: null,

  dropParentId: null,
  dropIndex: null,
  dropPosition: null,

  pointerX: 0,
  pointerY: 0,
  isDragging: false,
  dragStartTime: null,

  resizeId: null,
  resizeDirection: null,
  resizeStartX: 0,
  resizeStartY: 0,
  resizeStartRect: null,
  isResizing: false,

  freeformId: null,
  freeformStartX: 0,
  freeformStartY: 0,
  freeformOriginalLeft: 0,
  freeformOriginalTop: 0,
  isFreeforming: false,

  /* -------------------------------------------------
     DRAG ACTIONS
  ------------------------------------------------- */
  startDrag: (id, parentId, index) => {
    set({
      mode: "drag",
      draggingId: id,
      sourceParentId: parentId,
      sourceIndex: index,
      isDragging: true,
      dragStartTime: Date.now(),
    });
  },

  updateDragPointer: (x, y) =>
    set({
      pointerX: x,
      pointerY: y,
    }),

  setDropIntent: (parentId, index, pos) =>
    set({
      dropParentId: parentId,
      dropIndex: index,
      dropPosition: pos,
    }),

  performDrop: () => {
    const { draggingId, dropParentId, dropIndex } = get();
    const Blueprint = require("../state/useBlueprintStore"); // runtime require avoids circular import

    if (draggingId && dropParentId != null && dropIndex != null) {
      Blueprint.useBlueprintStore
        .getState()
        .moveNode(draggingId, dropParentId, dropIndex);
    }

    set({
      mode: "none",
      draggingId: null,
      dropParentId: null,
      dropIndex: null,
      dropPosition: null,
      isDragging: false,
    });
  },

  /* -------------------------------------------------
     RESIZE ACTIONS
  ------------------------------------------------- */
  startResize: (id, direction, startX, startY, rect) => {
    set({
      mode: "resize",
      resizeId: id,
      resizeDirection: direction,
      resizeStartX: startX,
      resizeStartY: startY,
      resizeStartRect: rect,
      isResizing: true,
    });
  },

  updateResize: (clientX, clientY) => {
    set({
      pointerX: clientX,
      pointerY: clientY,
    });
  },

  commitResize: () => {
    set({
      mode: "none",
      resizeId: null,
      resizeDirection: null,
      isResizing: false,
    });
  },

  /* -------------------------------------------------
     FREEFORM ACTIONS
  ------------------------------------------------- */
  startFreeform: (id, startX, startY, left, top) => {
    set({
      mode: "freeform",
      freeformId: id,
      freeformStartX: startX,
      freeformStartY: startY,
      freeformOriginalLeft: left,
      freeformOriginalTop: top,
      isFreeforming: true,
    });
  },

  updateFreeform: (clientX, clientY) => {
    set({
      pointerX: clientX,
      pointerY: clientY,
    });
  },

  commitFreeform: () => {
    set({
      mode: "none",
      freeformId: null,
      isFreeforming: false,
    });
  },

  /* -------------------------------------------------
     RESET
  ------------------------------------------------- */
  reset: () => {
    set({
      mode: "none",

      draggingId: null,
      sourceParentId: null,
      sourceIndex: null,

      dropParentId: null,
      dropIndex: null,
      dropPosition: null,

      isDragging: false,
      dragStartTime: null,

      resizeId: null,
      resizeDirection: null,
      isResizing: false,

      freeformId: null,
      isFreeforming: false,
    });
  },
}));
