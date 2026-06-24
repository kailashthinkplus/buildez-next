"use client";

import { create } from "zustand";
import { DesignTokens } from "./designTokens.types";

interface DesignTokensState {
  tokens: DesignTokens | null;
  setTokens(tokens: DesignTokens): void;
}

export const useDesignTokensStore =
  create<DesignTokensState>((set) => ({
    tokens: null,
    setTokens: (tokens) => set({ tokens }),
  }));
