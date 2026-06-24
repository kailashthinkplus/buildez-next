import { create } from "zustand";

interface PanelStore {
  leftPanel: string | null;
  isLeftPanelOpen: boolean;
  setLeftPanel: (panel: string | null) => void;
  togglePanel: (panel: string) => void;
  closeLeftPanel: () => void;
}

export const usePanelStore = create<PanelStore>((set, get) => ({
  leftPanel: null,
  isLeftPanelOpen: false,

  setLeftPanel: (panel) => {
    if (!panel) {
      set({ leftPanel: null, isLeftPanelOpen: false });
    } else {
      set({ leftPanel: panel, isLeftPanelOpen: true });
    }
  },

  togglePanel: (panel) => {
    const { leftPanel, isLeftPanelOpen } = get();

    // Toggle close
    if (leftPanel === panel && isLeftPanelOpen) {
      set({ leftPanel: null, isLeftPanelOpen: false });
      return;
    }

    // Open new
    set({ leftPanel: panel, isLeftPanelOpen: true });
  },

  closeLeftPanel: () => set({ leftPanel: null, isLeftPanelOpen: false }),
}));
