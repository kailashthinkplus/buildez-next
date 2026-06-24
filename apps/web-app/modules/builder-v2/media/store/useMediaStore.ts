"use client";

import { create } from "zustand";
import { builderApi } from "../../api";

import type { MediaAsset, MediaSource } from "../types/media";

type Filter =
  | "ALL"
  | MediaSource
  | "FAVORITES"
  | "UNUSED";

interface MediaStore {

  assets: MediaAsset[];

  loading: boolean;

  uploading: boolean;

  generating: boolean;

  selected?: MediaAsset;

  search: string;

  filter: Filter;

  /* ========================= */

  load(siteId: string): Promise<void>;

  add(asset: MediaAsset): void;

  remove(id: string): void;

  select(asset?: MediaAsset): void;

  setSearch(search: string): void;

  setFilter(filter: Filter): void;

  refresh(siteId: string): Promise<void>;

}

export const useMediaStore = create<MediaStore>((set, get) => ({

  assets: [],

  loading: false,

  uploading: false,

  generating: false,

  selected: undefined,

  search: "",

  filter: "ALL",

  async load(siteId) {

    set({
      loading: true,
    });

    try {

      const res: any = await builderApi.media.list(siteId);

      set({
        assets: res.assets ?? [],
      });

    } finally {

      set({
        loading: false,
      });

    }

  },

  async refresh(siteId) {

    await get().load(siteId);

  },

  add(asset) {

    set((state) => ({
      assets: [
        asset,
        ...state.assets,
      ],
    }));

  },

  remove(id) {

    set((state) => ({
      assets: state.assets.filter(
        a => a.id !== id
      ),
    }));

  },

  select(asset) {

    set({
      selected: asset,
    });

  },

  setSearch(search) {

    set({
      search,
    });

  },

  setFilter(filter) {

    set({
      filter,
    });

  },

}));