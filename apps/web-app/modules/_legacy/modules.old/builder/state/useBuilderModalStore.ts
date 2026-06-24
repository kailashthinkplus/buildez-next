"use client";

import { create } from "zustand";

interface ModalStore {
  open: boolean;
  parentId: string | null;
  openModal: (parentId: string | null) => void;
  close: () => void;
}

export const useBuilderModalStore = create<ModalStore>((set) => ({
  open: false,
  parentId: null,

  openModal: (parentId) =>
    set({
      open: true,
      parentId,
    }),

  close: () =>
    set({
      open: false,
      parentId: null,
    }),
}));
