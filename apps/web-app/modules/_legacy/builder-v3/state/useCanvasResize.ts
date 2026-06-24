"use client";

import { create } from "zustand";

interface CanvasResizeState {
  viewportWidth: number | "auto";
  device: "desktop" | "tablet" | "mobile";

  setDevice: (d: CanvasResizeState["device"]) => void;
  setViewportWidth: (w: number | "auto") => void;
}

export const useCanvasResize = create<CanvasResizeState>((set) => ({
  viewportWidth: "auto",
  device: "desktop",

  setDevice: (device) => {
    const preset =
      device === "desktop" ? "auto" :
      device === "tablet" ? 768 :
      390;

    set({ device, viewportWidth: preset });
  },

  setViewportWidth: (w) => set({ viewportWidth: w }),
}));
