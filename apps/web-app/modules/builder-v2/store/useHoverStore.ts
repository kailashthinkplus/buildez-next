"use client";

import { create } from "zustand";

interface HoverStore {
  hoveredNodeId: string | null;
  setHoveredNodeId(nodeId: string | null): void;
}

export const useHoverStore = create<HoverStore>((set) => ({
  hoveredNodeId: null,
  setHoveredNodeId(nodeId) {
    set({ hoveredNodeId: nodeId });
  },
}));
