"use client";

import { create } from "zustand";

/* -------------------------------------------------------------
   TYPES
------------------------------------------------------------- */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasState {
  /* Refs */
  canvasRef: HTMLDivElement | null;

  /* Zoom + Device */
  zoom: number;
  device: "desktop" | "tablet" | "mobile";

  /* Theme */
  isDarkMode: boolean;

  /* Scroll */
  scrollX: number;
  scrollY: number;

  /* Hover */
  hoveredId: string | null;

  /* Registry of node rects */
  rects: Record<string, Rect>;
  nodeRefs: Record<string, HTMLElement | null>;

  /* Actions */
  setCanvasRef: (el: HTMLDivElement | null) => void;

  setZoom: (value: number) => void;
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;

  toggleDarkMode: () => void;

  setScroll: (x: number, y: number) => void;

  setHoveredId: (id: string | null) => void;

  registerNodeRef: (id: string, el: HTMLElement | null) => void;
  measureNode: (id: string) => void;
  getNodeRect: (id: string) => Rect | null;

  invalidateRects: () => void;
}

/* -------------------------------------------------------------
   STORE
------------------------------------------------------------- */

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvasRef: null,

  zoom: 1,
  device: "desktop",

  isDarkMode: false,

  scrollX: 0,
  scrollY: 0,

  hoveredId: null,

  rects: {},
  nodeRefs: {},

  /* ---------------------------------------------------------
     REFS
  --------------------------------------------------------- */
  setCanvasRef: (el) => set({ canvasRef: el }),

  /* ---------------------------------------------------------
     ZOOM + DEVICE
  --------------------------------------------------------- */
  setZoom: (value) => set({ zoom: value }),

  setDevice: (device) => set({ device }),

  toggleDarkMode: () =>
    set((s) => ({ isDarkMode: !s.isDarkMode })),

  /* ---------------------------------------------------------
     SCROLL
  --------------------------------------------------------- */
  setScroll: (x, y) =>
    set({ scrollX: x, scrollY: y }),

  /* ---------------------------------------------------------
     HOVER
  --------------------------------------------------------- */
  setHoveredId: (id) => set({ hoveredId: id }),

  /* ---------------------------------------------------------
     NODE REFS + RECT MEASUREMENT
  --------------------------------------------------------- */
  registerNodeRef: (id, el) => {
    const state = get();
    state.nodeRefs[id] = el;
    if (el) {
      const rect = el.getBoundingClientRect();
      state.rects[id] = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
      set({ rects: { ...state.rects } });
    }
  },

  measureNode: (id) => {
    const state = get();
    const el = state.nodeRefs[id];
    if (!el) return;

    const rect = el.getBoundingClientRect();

    state.rects[id] = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };

    set({ rects: { ...state.rects } });
  },

  getNodeRect: (id) => {
    const r = get().rects[id];
    return r || null;
  },

  /* ---------------------------------------------------------
     INVALIDATE ALL RECTANGLES
  --------------------------------------------------------- */
  invalidateRects: () => {
    const state = get();
    const updated: Record<string, Rect> = {};

    Object.keys(state.nodeRefs).forEach((id) => {
      const el = state.nodeRefs[id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      updated[id] = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });

    set({ rects: updated });
  },
}));
