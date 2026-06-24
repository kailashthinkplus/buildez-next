import { create } from "zustand";
import { RuntimeSite } from "./runtimeTypes";

interface RuntimeState {
  site: RuntimeSite | null;
  setSite: (s: RuntimeSite | null) => void;
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  site: null,
  setSite: (s) => set({ site: s }),
}));
