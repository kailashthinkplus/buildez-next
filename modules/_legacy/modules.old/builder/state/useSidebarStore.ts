// /apps/web-app/modules/builder/state/useSidebarStore.ts
"use client";

import { create } from "zustand";

interface SidebarState {
  isAiOpen: boolean;
  toggleAi: () => void;
  closeAi: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isAiOpen: false,

  toggleAi: () =>
    set((s) => ({
      isAiOpen: !s.isAiOpen,
    })),

  closeAi: () => set({ isAiOpen: false }),
}));
