"use client";

import { create } from "zustand";

interface PanelStore {
  activePanel: "layers" | "components" | "ai" | "media" | "colors" | "themes" | "settings" | null;
  setActivePanel(panel: PanelStore["activePanel"]): void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  activePanel: "layers",
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
