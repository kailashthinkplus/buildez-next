import { create } from "zustand";
import { CollabPresence } from "./collabTypes";

interface PresenceState {
  presence: Record<string, CollabPresence>;
  update: (p: CollabPresence) => void;
}

export const useCollabPresence = create<PresenceState>((set) => ({
  presence: {},
  update: (p) =>
    set((s) => ({
      presence: {
        ...s.presence,
        [p.userId]: p,
      },
    })),
}));
