import { create } from "zustand";
import { Tokens, TokenUpdate } from "./tokensTypes";

interface TokenState {
  tokens: Tokens;
  updateToken: (u: TokenUpdate) => void;
  setTokens: (t: Tokens) => void;
}

export const useTokensStore = create<TokenState>((set) => ({
  tokens: {
    colors: {},
    fonts: {},
    spacing: {},
    shadows: {},
  },

  updateToken: (u) => {},

  setTokens: (t) => set({ tokens: t }),
}));
