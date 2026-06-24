"use client";

import { create } from "zustand";

type LeftPanelType =
  | "none"
  | "blocks"
  | "navigator"
  | "styles"
  | "animations"
  | "effects";

type RightPanelType =
  | "none"
  | "inspector";

interface PanelStore {
  /* ------------------ LEFT SIDEBAR ------------------ */
  leftPanel: LeftPanelType;
  setLeftPanel: (panel: LeftPanelType) => void;

  /* ------------------ RIGHT SIDEBAR ------------------ */
  rightPanel: RightPanelType;
  setRightPanel: (panel: RightPanelType) => void;

  /* ------------------ GLOBAL CLOSERS ------------------ */
  closeAll: () => void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  /* LEFT */
  leftPanel: "none",
  setLeftPanel: (panel) => set({ leftPanel: panel }),

  /* RIGHT */
  rightPanel: "inspector",
  setRightPanel: (panel) => set({ rightPanel: panel }),

  /* CLOSE EVERYTHING */
  closeAll: () =>
    set({
      leftPanel: "none",
      rightPanel: "none",
    }),
}));
