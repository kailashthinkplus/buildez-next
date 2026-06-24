"use client";

import { create } from "zustand";

interface PointerState {
  x: number;
  y: number;
  isDown: boolean;
  targetId: string | null;

  setXY: (x: number, y: number) => void;
  setDown: (v: boolean) => void;
  setTarget: (id: string | null) => void;
}

export const usePointerStore = create<PointerState>((set) => ({
  x: 0,
  y: 0,
  isDown: false,
  targetId: null,

  setXY: (x, y) => set({ x, y }),
  setDown: (v) => set({ isDown: v }),
  setTarget: (id) => set({ targetId: id }),
}));
