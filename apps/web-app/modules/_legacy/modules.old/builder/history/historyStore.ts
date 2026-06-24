import { create } from "zustand";
import { HistorySnapshot, HistoryEntry } from "./historyTypes";

interface HistoryState {
  snapshots: Record<string, HistorySnapshot>;

  initPage: (pageId: string, initial: HistoryEntry) => void;
  push: (pageId: string, entry: HistoryEntry) => void;
  undo: (pageId: string) => HistoryEntry | null;
  redo: (pageId: string) => HistoryEntry | null;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  snapshots: {},

  initPage: (pageId, initial) => {
    set((s) => ({
      snapshots: {
        ...s.snapshots,
        [pageId]: {
          pageId,
          entries: [initial],
          pointer: 0,
        },
      },
    }));
  },

  push: (pageId, entry) => {
    const state = get();
    const snapshot = state.snapshots[pageId];

    if (!snapshot) return;

    const newEntries = snapshot.entries.slice(0, snapshot.pointer + 1);
    newEntries.push(entry);

    set((s) => ({
      snapshots: {
        ...s.snapshots,
        [pageId]: {
          ...snapshot,
          entries: newEntries,
          pointer: newEntries.length - 1,
        },
      },
    }));
  },

  undo: (pageId) => {
    const snapshot = get().snapshots[pageId];
    if (!snapshot || snapshot.pointer === 0) return null;

    const newPointer = snapshot.pointer - 1;
    return snapshot.entries[newPointer];
  },

  redo: (pageId) => {
    const snapshot = get().snapshots[pageId];
    if (!snapshot) return null;

    if (snapshot.pointer >= snapshot.entries.length - 1) return null;

    const newPointer = snapshot.pointer + 1;
    return snapshot.entries[newPointer];
  },
}));
