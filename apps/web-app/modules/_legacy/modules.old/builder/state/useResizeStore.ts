"use client";

import { create } from "zustand";

import { useBlueprintStore } from "./useBlueprintStore";

// ✅ Real resize engines (V3)
import { performResize } from "@/modules/builder/resize/performResize";
import { computeResizeSnap } from "@/modules/builder/resize/computeResizeSnap";
import { updateSize } from "@/modules/builder/resize/updateSize";

interface ResizeState {
  activeId: string | null;
  handle: string | null;

  startX: number;
  startY: number;

  startRect: {
    x: number;
    y: number;
    w: number;
    h: number;
  } | null;

  snapping: boolean;

  beginResize: (
    id: string,
    handle: string,
    startX: number,
    startY: number,
    rect: any
  ) => void;

  updateResize: (x: number, y: number) => void;

  endResize: () => void;
}

export const useResizeStore = create<ResizeState>((set, get) => ({
  activeId: null,
  handle: null,

  startX: 0,
  startY: 0,

  startRect: null,

  snapping: true,

  // -------------------------
  // START RESIZE
  // -------------------------
  beginResize(id, handle, startX, startY, rect) {
    set({
      activeId: id,
      handle,
      startX,
      startY,
      startRect: rect,
    });
  },

  // -------------------------
  // UPDATE RESIZE (mousemove)
  // -------------------------
  updateResize(x, y) {
    const state = get();
    if (!state.activeId || !state.startRect) return;

    const dx = x - state.startX;
    const dy = y - state.startY;

    // 1) Compute new size/position
    let resized = performResize(state.startRect, {
      handle: state.handle!,
      dx,
      dy,
    });

    // 2) Optional snap
    if (state.snapping) {
      resized = computeResizeSnap(resized);
    }

    // 3) Apply updates to blueprint tree
    useBlueprintStore
      .getState()
      .updateLayout(state.activeId, {
        width: resized.w,
        height: resized.h,
        x: resized.x,
        y: resized.y,
      });
  },

  // -------------------------
  // END RESIZE (mouseup)
  // -------------------------
  endResize() {
    set({
      activeId: null,
      handle: null,
      startX: 0,
      startY: 0,
      startRect: null,
    });
  },
}));
