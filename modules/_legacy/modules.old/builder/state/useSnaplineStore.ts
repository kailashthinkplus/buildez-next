import { create } from "zustand";

export const useSnaplineStore = create((set) => ({
  visible: false,
  vertical: null,
  horizontal: null,

  showSnapline: (data) =>
    set({
      visible: true,
      vertical: data.vertical ?? null,
      horizontal: data.horizontal ?? null,
    }),

  clearSnapline: () =>
    set({
      visible: false,
      vertical: null,
      horizontal: null,
    }),
}));
