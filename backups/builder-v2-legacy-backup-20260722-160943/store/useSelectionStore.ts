"use client";

import { create } from "zustand";

interface SelectionStore {
  selectedNodeId: string | null;

  hoveredNodeId: string | null;

  multiSelection: string[];

  select(nodeId: string | null): void;

  hover(nodeId: string | null): void;

  toggle(nodeId: string): void;

  clear(): void;

  isSelected(nodeId: string): boolean;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({

  selectedNodeId: null,

  hoveredNodeId: null,

  multiSelection: [],

  select(nodeId) {
    set({
      selectedNodeId: nodeId,
      multiSelection: nodeId ? [nodeId] : [],
    });
  },

  hover(nodeId) {
    set({
      hoveredNodeId: nodeId,
    });
  },

  toggle(nodeId) {
    const { multiSelection } = get();

    const exists = multiSelection.includes(nodeId);

    set({
      multiSelection: exists
        ? multiSelection.filter(id => id !== nodeId)
        : [...multiSelection, nodeId],
    });
  },

  clear() {
    set({
      selectedNodeId: null,
      hoveredNodeId: null,
      multiSelection: [],
    });
  },

  isSelected(nodeId) {
    return get().multiSelection.includes(nodeId);
  },

}));