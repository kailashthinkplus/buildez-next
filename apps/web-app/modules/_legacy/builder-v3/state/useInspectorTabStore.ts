import { create } from "zustand";

export const useInspectorTabStore = create<{
  tab: "content" | "style" | "layout" | "effects";
  setTab: (t: any) => void;
}>((set) => ({
  tab: "content",
  setTab: (t) => set({ tab: t }),
}));
