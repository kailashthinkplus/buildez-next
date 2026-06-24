import { create } from "zustand";
import { MediaItem } from "./mediaTypes";

interface MediaState {
  items: MediaItem[];
  isOpen: boolean;
  selectedId: string | null;

  open: () => void;
  close: () => void;
  setItems: (items: MediaItem[]) => void;
  select: (id: string | null) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  items: [],
  isOpen: false,
  selectedId: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setItems: (items) => set({ items }),
  select: (id) => set({ selectedId: id }),
}));
