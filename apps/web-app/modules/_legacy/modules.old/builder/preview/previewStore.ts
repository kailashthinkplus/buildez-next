import { create } from "zustand";
import { PreviewState, Device } from "./previewTypes";

interface Store extends PreviewState {
  setDevice: (d: Device) => void;
  setZoom: (z: number) => void;
  togglePreview: () => void;
}

export const usePreviewStore = create<Store>((set) => ({
  device: "desktop",
  zoom: 1,
  isPreviewMode: false,

  setDevice: (d) => set({ device: d }),
  setZoom: (z) => set({ zoom: z }),
  togglePreview: () => set((s) => ({ isPreviewMode: !s.isPreviewMode })),
}));
