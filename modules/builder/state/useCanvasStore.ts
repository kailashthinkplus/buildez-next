// /Users/kailash/buildez/apps/web-app/modules/builder/state/useCanvasStore.ts

import { create } from "zustand";

type Device = "desktop" | "tablet" | "mobile";

interface DesignTokens {
  colors?: {
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    border?: string;
    primary?: string;
    primaryHover?: string;
    onPrimary?: string;
    accent?: string;
  };
  typography?: {
    fontFamily?: string;
    heading?: {
      fontFamily?: string;
      fontWeight?: number;
      letterSpacing?: string;
    };
    body?: {
      fontWeight?: number;
      lineHeight?: number;
    };
  };
  spacing?: {
    sectionY?: number;
    containerX?: number;
    blockGap?: number;
    radius?: number;
  };
  buttons?: {
    radius?: number;
    paddingY?: number;
    paddingX?: number;
  };
}

interface CanvasState {
  device: Device;
  zoom: number;
  isDarkMode: boolean;
  designTokens: DesignTokens | null;

  setDevice: (device: Device) => void;
  setZoom: (zoom: number) => void;
  toggleDarkMode: () => void;
  setDesignTokens: (tokens: DesignTokens | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  device: "desktop",
  zoom: 1,
  isDarkMode: false,
  designTokens: null,

  setDevice: (device) => set({ device }),
  setZoom: (zoom) => set({ zoom }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  setDesignTokens: (designTokens) => {
    console.log("[CanvasStore] Design tokens updated:", designTokens);
    set({ designTokens });
  },
}));