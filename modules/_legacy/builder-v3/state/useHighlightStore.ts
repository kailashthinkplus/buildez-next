"use client";

import { create } from "zustand";

/* ============================================================================
   HIGHLIGHT STORE — V3 CANONICAL
   --------------------------------
   PURPOSE:
   - Visual hover
   - Visual drag-over
   - NOTHING ELSE

   RULES:
   - NO geometry
   - NO selection (BlueprintStore owns selection)
   - ONE active highlight at a time
============================================================================ */

interface HighlightStoreState {
  /* -------------------------------------------------
     VISUAL STATES
  ------------------------------------------------- */
  hoveredNodeId: string | null;
  dragOverNodeId: string | null;

  /* -------------------------------------------------
     SETTERS
  ------------------------------------------------- */
  setHoveredNodeId: (id: string | null) => void;
  setDragOverNodeId: (id: string | null) => void;

  /* -------------------------------------------------
     RESET
  ------------------------------------------------- */
  clear: () => void;
}

export const useHighlightStore = create<HighlightStoreState>((set) => ({
  /* -------------------------------------------------
     STATE
  ------------------------------------------------- */
  hoveredNodeId: null,
  dragOverNodeId: null,

  /* -------------------------------------------------
     SETTERS
  ------------------------------------------------- */
  setHoveredNodeId: (id) =>
    set((state) =>
      state.hoveredNodeId === id ? state : { hoveredNodeId: id }
    ),

  setDragOverNodeId: (id) =>
    set((state) =>
      state.dragOverNodeId === id ? state : { dragOverNodeId: id }
    ),

  /* -------------------------------------------------
     RESET
  ------------------------------------------------- */
  clear: () =>
    set({
      hoveredNodeId: null,
      dragOverNodeId: null,
    }),
}));
