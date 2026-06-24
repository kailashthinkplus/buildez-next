import { create } from "zustand";
import { PublishSnapshot } from "./publishTypes";

interface SnapshotState {
  snapshots: PublishSnapshot[];
  addSnapshot: (s: PublishSnapshot) => void;
}

export const useSnapshotStore = create<SnapshotState>((set) => ({
  snapshots: [],
  addSnapshot: (s) =>
    set((st) => ({
      snapshots: [...st.snapshots, s],
    })),
}));
