"use client";

import { create } from "zustand";

/* -------------------------------------------------------------
   BUILDER UI STORE — FINAL V3 VERSION
   ✓ Supports: LeftToolbar, AiPanel, BlockMenu, InspectorPanel
   ✓ Includes all functions required by BuilderShell + panels
   ✓ Backward compatibility for your custom toggles
------------------------------------------------------------- */

interface BuilderUIStore {
  /* -------------------------
     ACTIVE TOOL (Primary)
  ------------------------- */
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  toggleTool: (tool: string) => void;
  clearTool: () => void;

  /* -------------------------
     FULL LEFT PANEL
  ------------------------- */
  isFullPanelOpen: boolean;
  openFullPanel: () => void;
  closeFullPanel: () => void;
  toggleFullPanel: () => void;

  /* -------------------------
     AI PANEL (Right side panel)
  ------------------------- */
  isAiOpen: boolean;
  openAi: () => void;
  closeAi: () => void;
  toggleAi: () => void;

  /* -------------------------
     BLOCK MENU (LeftSidebar)
  ------------------------- */
  isBlockMenuOpen: boolean;
  openBlockMenu: () => void;
  closeBlockMenu: () => void;
  toggleBlockMenu: () => void;

  /* -------------------------
     INSPECTOR PANEL (Right)
  ------------------------- */
  isInspectorOpen: boolean;
  openInspector: () => void;
  closeInspector: () => void;
  toggleInspector: () => void;

  /* -------------------------
     OPTIONAL PANELS (Your custom)
  ------------------------- */
  isLayersOpen: boolean;
  toggleLayers: () => void;

  isMediaOpen: boolean;
  toggleMedia: () => void;

  isColorsOpen: boolean;
  toggleColors: () => void;

  isSettingsOpen: boolean;
  toggleSettings: () => void;
}

export const useBuilderUIStore = create<BuilderUIStore>((set, get) => ({
  /* ---------------------------------------------------------
     ACTIVE TOOL
  --------------------------------------------------------- */
  activeTool: null,

  setActiveTool: (tool) => set({ activeTool: tool }),

  toggleTool: (tool) => {
    const { activeTool } = get();
    const isSame = activeTool === tool;

    set({
      activeTool: isSame ? null : tool,
      isFullPanelOpen: !isSame,
    });
  },

  clearTool: () => set({ activeTool: null }),

  /* ---------------------------------------------------------
     FULL PANEL
  --------------------------------------------------------- */
  isFullPanelOpen: false,
  openFullPanel: () => set({ isFullPanelOpen: true }),
  closeFullPanel: () => set({ isFullPanelOpen: false }),
  toggleFullPanel: () =>
    set((s) => ({ isFullPanelOpen: !s.isFullPanelOpen })),

  /* ---------------------------------------------------------
     AI PANEL
  --------------------------------------------------------- */
  isAiOpen: false,
  openAi: () => set({ isAiOpen: true }),
  closeAi: () => set({ isAiOpen: false }),
  toggleAi: () => set((s) => ({ isAiOpen: !s.isAiOpen })),

  /* ---------------------------------------------------------
     BLOCK MENU
  --------------------------------------------------------- */
  isBlockMenuOpen: false,
  openBlockMenu: () => set({ isBlockMenuOpen: true }),
  closeBlockMenu: () => set({ isBlockMenuOpen: false }),
  toggleBlockMenu: () =>
    set((s) => ({ isBlockMenuOpen: !s.isBlockMenuOpen })),

  /* ---------------------------------------------------------
     INSPECTOR PANEL
  --------------------------------------------------------- */
  isInspectorOpen: true,
  openInspector: () => set({ isInspectorOpen: true }),
  closeInspector: () => set({ isInspectorOpen: false }),
  toggleInspector: () =>
    set((s) => ({ isInspectorOpen: !s.isInspectorOpen })),

  /* ---------------------------------------------------------
     CUSTOM PANELS (your original ones)
  --------------------------------------------------------- */
  isLayersOpen: false,
  toggleLayers: () => set((s) => ({ isLayersOpen: !s.isLayersOpen })),

  isMediaOpen: false,
  toggleMedia: () => set((s) => ({ isMediaOpen: !s.isMediaOpen })),

  isColorsOpen: false,
  toggleColors: () => set((s) => ({ isColorsOpen: !s.isColorsOpen })),

  isSettingsOpen: false,
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
}));
