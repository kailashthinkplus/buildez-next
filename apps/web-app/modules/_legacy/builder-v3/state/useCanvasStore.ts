"use client";

import { create } from "zustand";
import { RefObject } from "react";

/* ============================================================================
   CANVAS STORE — INTERACTION LAYER ONLY (V3 CANONICAL)
   - NO blueprint mutations
   - NO structural logic
   - UI + pointer + viewport only
============================================================================ */

/* ---------------------------------------------------------------------------
   MAIN CANVAS STORE
--------------------------------------------------------------------------- */
interface CanvasStoreState {
  /* ---------------- THEME ---------------- */
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  /* ---------------- HOVER / DRAG HIGHLIGHTS ----------------
     NOTE:
     - These are VISUAL ONLY
     - Blueprint selection lives elsewhere
  ----------------------------------------------------------- */
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;

  dragOverNodeId: string | null;
  setDragOverNodeId: (id: string | null) => void;

  /* ---------------- DEVICE MODE ---------------- */
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: CanvasStoreState["device"]) => void;

  /* ---------------- ZOOM / SCALE ----------------
     zoom  = UI percentage (100, 90, 80…)
     scale = actual CSS transform scale
  ------------------------------------------------ */
  zoom: number;
  setZoom: (z: number) => void;

  scale: number;
  setScale: (v: number) => void;

  /* ---------------- GRID OVERLAY ---------------- */
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;

  /* ---------------- CANVAS REF ----------------
     Required by:
     - CanvasEventBridge
     - AutoScroll
     - GhostRenderer
     - HighlightOverlay
  ------------------------------------------------ */
  canvasRef: RefObject<HTMLDivElement> | null;
  setCanvasRef: (ref: RefObject<HTMLDivElement>) => void;

  /* ---------------- POINTER ----------------
     Absolute pointer position (viewport)
     Source of truth for drag + hover math
  ------------------------------------------------ */
  pointerX: number;
  pointerY: number;
  setPointerX: (x: number) => void;
  setPointerY: (y: number) => void;
}

/* ---------------------------------------------------------------------------
   MAIN CANVAS STORE IMPLEMENTATION
--------------------------------------------------------------------------- */
export const useCanvasStore = create<CanvasStoreState>((set) => ({
  /* ---------------- THEME ---------------- */
  isDarkMode: false,
  toggleDarkMode: () =>
    set((s) => ({ isDarkMode: !s.isDarkMode })),

  /* ---------------- HOVER / DRAG ---------------- */
  hoveredNodeId: null,
  setHoveredNodeId: (id) =>
    set({ hoveredNodeId: id }),

  dragOverNodeId: null,
  setDragOverNodeId: (id) =>
    set({ dragOverNodeId: id }),

  /* ---------------- DEVICE ---------------- */
  device: "desktop",
  setDevice: (device) =>
    set({ device }),

  /* ---------------- ZOOM / SCALE ---------------- */
  zoom: 100,
  setZoom: (zoom) =>
    set({ zoom }),

  scale: 1,
  setScale: (scale) =>
    set({ scale }),

  /* ---------------- GRID ---------------- */
  showGrid: false,
  setShowGrid: (v) =>
    set({ showGrid: v }),

  /* ---------------- CANVAS REF ---------------- */
  canvasRef: null,
  setCanvasRef: (ref) =>
    set({ canvasRef: ref }),

  /* ---------------- POINTER ---------------- */
  pointerX: 0,
  pointerY: 0,
  setPointerX: (x) =>
    set({ pointerX: x }),
  setPointerY: (y) =>
    set({ pointerY: y }),
}));

/* ============================================================================
   CANVAS RESIZE STORE (SECONDARY / ISOLATED)
   - Controls viewport width simulation
   - No coupling with CanvasStore
============================================================================ */

interface CanvasResizeState {
  viewportWidth: number | "auto";
  device: "desktop" | "tablet" | "mobile";

  setDevice: (d: CanvasResizeState["device"]) => void;
  setViewportWidth: (w: number | "auto") => void;
}

export const useCanvasResize = create<CanvasResizeState>((set) => ({
  viewportWidth: "auto",
  device: "desktop",

  /* ---------------------------------------------------------
     DEVICE PRESETS
     desktop → auto
     tablet  → 768
     mobile  → 390
  --------------------------------------------------------- */
  setDevice: (device) => {
    const presetWidth =
      device === "desktop"
        ? "auto"
        : device === "tablet"
        ? 768
        : 390;

    set({
      device,
      viewportWidth: presetWidth,
    });
  },

  setViewportWidth: (viewportWidth) =>
    set({ viewportWidth }),
}));
