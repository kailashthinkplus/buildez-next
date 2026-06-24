import { create } from "zustand";

interface BuilderUIState {
  activeTool: string | null;
  isFullPanelOpen: boolean;

  toggleTool: (tool: string) => void;
  openFullPanel: () => void;
  closeFullPanel: () => void;
}

export const useBuilderUIStore = create<BuilderUIState>((set, get) => ({
  activeTool: null,
  isFullPanelOpen: false,

  toggleTool: (tool) =>
    set((state) => ({
      activeTool: state.activeTool === tool ? null : tool,
    })),

  openFullPanel: () => set({ isFullPanelOpen: true }),
  closeFullPanel: () => set({ isFullPanelOpen: false }),
}));
