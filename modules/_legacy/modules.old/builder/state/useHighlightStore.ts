"use client";

import { create } from "zustand";

interface HighlightState {
  hoverId: string | null;
  selectedId: string | null;

  setHover: (id: string | null) => void;
  setSelected: (id: string | null) => void;

  // Derived state for NodeWrapper/SectionWrapper
  isHovered: (id: string) => boolean;
  isSelectedNode: (id: string) => boolean;
}

export const useHighlightStore = create<HighlightState>((set, get) => ({
  hoverId: null,
  selectedId: null,

  setHover: (id) => set({ hoverId: id }),
  setSelected: (id) => set({ selectedId: id }),

  isHovered: (id) => get().hoverId === id,
  isSelectedNode: (id) => get().selectedId === id,
}));
