"use client";

import { create } from "zustand";

/* ============================================================
   PANEL TYPES
============================================================ */

export type LeftPanelType =
  | "ai"
  | "blocks"
  | "components"
  | "layers"
  | "media"
  | "colors"
  | "settings"
  | null;

/* ============================================================
   STORE STATE
============================================================ */

interface PanelState {
  /** Currently active left panel */
  leftPanel: LeftPanelType;

  /** Whether left panel container is visible */
  isLeftPanelOpen: boolean;

  /* ----------------------------------------------------------
     ACTIONS
  ---------------------------------------------------------- */

  openLeftPanel(panel: LeftPanelType): void;
  closeLeftPanel(): void;
  togglePanel(panel: LeftPanelType): void;
}

/* ============================================================
   usePanelStore — V4 SAFE
   ------------------------------------------------------------
   RULES:
   - Single source of truth for left panel
   - No builder / blueprint / canvas coupling
   - UI-only responsibility
============================================================ */

export const usePanelStore = create<PanelState>((set, get) => ({
  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  leftPanel: null,
  isLeftPanelOpen: false,

  /* ----------------------------------------------------------
     ACTIONS
  ---------------------------------------------------------- */

  openLeftPanel(panel) {
    if (!panel) return;

    set({
      leftPanel: panel,
      isLeftPanelOpen: true,
    });
  },

  closeLeftPanel() {
    set({
      leftPanel: null,
      isLeftPanelOpen: false,
    });
  },

  togglePanel(panel) {
    const { leftPanel, isLeftPanelOpen } = get();

    // Same panel → toggle visibility
    if (leftPanel === panel && isLeftPanelOpen) {
      set({
        leftPanel: null,
        isLeftPanelOpen: false,
      });
      return;
    }

    // Different panel → switch & open
    set({
      leftPanel: panel,
      isLeftPanelOpen: true,
    });
  },
}));
