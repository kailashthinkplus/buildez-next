"use client";

import { create } from "zustand";

interface ViewportStore {
  scale: number;
  offsetX: number;
  offsetY: number;
  setScale(scale: number): void;
  setOffset(x: number, y: number): void;
}

export const useViewportStore = create<ViewportStore>((set) => ({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  setScale: (scale) => set({ scale }),
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
}));
