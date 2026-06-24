"use client";

import { create } from "zustand";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useCanvasThemeStore = create<ThemeStore>((set) => ({
  theme: "light", // Default is light mode
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));
