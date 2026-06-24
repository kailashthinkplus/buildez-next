"use client";

import { create } from "zustand";

type InspectorTab = "content" | "layout" | "styles" | "effects";

interface InspectorState {
  isOpen: boolean;
  activeTab: InspectorTab;
  selectedNodeId: string | null;

  // actions
  openInspector: (nodeId: string) => void;
  closeInspector: () => void;
  setTab: (tab: InspectorTab) => void;
  setSelectedNodeId: (id: string | null) => void;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  isOpen: false,
  activeTab: "content",
  selectedNodeId: null,

  openInspector: (nodeId) =>
    set({
      isOpen: true,
      selectedNodeId: nodeId,
    }),

  closeInspector: () =>
    set({
      isOpen: false,
      selectedNodeId: null,
    }),

  setTab: (tab) =>
    set({
      activeTab: tab,
    }),

  setSelectedNodeId: (id) =>
    set({
      selectedNodeId: id,
      isOpen: id ? true : false,
    }),
}));
