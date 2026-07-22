"use client";

import { create } from "zustand";

export type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface CanvasStore {
  /* ==========================================================
     VIEWPORT
  ========================================================== */

  device: Device;

  zoom: number;

  isDarkMode: boolean;

  /* ==========================================================
     OVERLAYS
  ========================================================== */

  showGrid: boolean;

  showRulers: boolean;

  showOutlines: boolean;

  /* ==========================================================
     ACTIONS
  ========================================================== */

  setDevice(device: Device): void;

  setZoom(zoom: number): void;

  zoomIn(): void;

  zoomOut(): void;

  fitToPage(): void;

  resetZoom(): void;

  toggleDarkMode(): void;

  toggleGrid(): void;

  toggleRulers(): void;

  toggleOutlines(): void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({

  /* ==========================================================
     DEFAULTS
  ========================================================== */

  device: "desktop",

  zoom: 100,

  isDarkMode: false,

  showGrid: false,

  showRulers: false,

  showOutlines: true,

  /* ==========================================================
     DEVICE
  ========================================================== */

  setDevice(device) {
    set({ device });
  },

  /* ==========================================================
     ZOOM
  ========================================================== */

  setZoom(zoom) {
    set({
      zoom: Math.max(25, Math.min(200, zoom)),
    });
  },

  zoomIn() {
    set((state) => ({
      zoom: Math.min(200, state.zoom + 10),
    }));
  },

  zoomOut() {
    set((state) => ({
      zoom: Math.max(25, state.zoom - 10),
    }));
  },

  fitToPage() {
    set({
      zoom: 100,
    });
  },

  resetZoom() {
    set({
      zoom: 100,
    });
  },

  /* ==========================================================
     THEME
  ========================================================== */

  toggleDarkMode() {
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    }));
  },

  /* ==========================================================
     OVERLAYS
  ========================================================== */

  toggleGrid() {
    set((state) => ({
      showGrid: !state.showGrid,
    }));
  },

  toggleRulers() {
    set((state) => ({
      showRulers: !state.showRulers,
    }));
  },

  toggleOutlines() {
    set((state) => ({
      showOutlines: !state.showOutlines,
    }));
  },

}));