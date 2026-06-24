"use client";

import { useCanvasStore } from "./useCanvasStore";

/**
 * getDevice
 * Lightweight selector used by the renderer engine.
 * 
 * Returns the active device mode: "desktop" | "tablet" | "mobile".
 */
export function getDevice() {
  return useCanvasStore.getState().device || "desktop";
}
