import { create } from "zustand";

/**
 * DragGhostStore:
 * - supports resize ghost box
 * - supports smooth motion + snapping
 * - reused by both DnD and Resize engine
 */

interface GhostBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DragGhostState {
  visible: boolean;
  box: GhostBox | null;

  showGhost: (box: GhostBox) => void;
  moveGhost: (x: number, y: number, w?: number, h?: number) => void;
  hideGhost: () => void;
}

export const useDragGhostStore = create<DragGhostState>((set) => ({
  visible: false,
  box: null,

  showGhost: (box) =>
    set({
      visible: true,
      box,
    }),

  moveGhost: (x, y, w, h) =>
    set((s) => {
      if (!s.box) return s;
      return {
        box: {
          top: y,
          left: x,
          width: w ?? s.box.width,
          height: h ?? s.box.height,
        },
      };
    }),

  hideGhost: () =>
    set({
      visible: false,
      box: null,
    }),
}));
