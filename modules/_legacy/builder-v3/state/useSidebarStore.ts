"use client";

import { create } from "zustand";

interface SidebarState {
  isInspectorOpen: boolean;
  isAiPanelOpen: boolean;

  openInspector: () => void;
  closeInspector: () => void;
  toggleInspector: () => void;

  openAiPanel: () => void;
  closeAiPanel: () => void;
  toggleAiPanel: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */
  isInspectorOpen: false,
  isAiPanelOpen: false,

  /* ---------------------------------------------------------
     INSPECTOR
     --------------------------------------------------------- */
  openInspector: () => set({ isInspectorOpen: true }),
  closeInspector: () => set({ isInspectorOpen: false }),
  toggleInspector: () =>
    set((s) => ({ isInspectorOpen: !s.isInspectorOpen })),

  /* ---------------------------------------------------------
     AI PANEL
     --------------------------------------------------------- */
  openAiPanel: () => set({ isAiPanelOpen: true }),
  closeAiPanel: () => set({ isAiPanelOpen: false }),
  toggleAiPanel: () =>
    set((s) => ({ isAiPanelOpen: !s.isAiPanelOpen })),
}));
