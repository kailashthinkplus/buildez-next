"use client";

import { create } from "zustand";

import type {
  BuilderBlueprint,
  BuilderNode,
} from "../types/blueprint";

import { commandBus } from "../core/commands/CommandBus";

/* ==========================================================
   Builder Store
========================================================== */

interface BuilderState {
  /* --------------------------------------------------------
     Core
  -------------------------------------------------------- */

  blueprint: BuilderBlueprint | null;

  loading: boolean;

  dirty: boolean;

  clipboard: BuilderNode | null;

  /* --------------------------------------------------------
     Actions
  -------------------------------------------------------- */

  initialize(blueprint: BuilderBlueprint): void;

  setBlueprint(blueprint: BuilderBlueprint): void;

  setClipboard(node: BuilderNode | null): void;

  markDirty(): void;

  clearDirty(): void;
}

/* ==========================================================
   CommandBus Subscription
========================================================== */

let unsubscribeCommandBus: (() => void) | null = null;

/* ==========================================================
   Store
========================================================== */

export const useBuilderStore = create<BuilderState>((set) => ({
  /* --------------------------------------------------------
     State
  -------------------------------------------------------- */

  blueprint: null,

  loading: true,

  dirty: false,

  clipboard: null,

  /* --------------------------------------------------------
     Initialize Builder
  -------------------------------------------------------- */

  initialize(blueprint) {
    // Prevent duplicate subscriptions during Fast Refresh
    unsubscribeCommandBus?.();

    commandBus.initialize(blueprint);

    set({
      blueprint,
      loading: false,
      dirty: false,
    });

    unsubscribeCommandBus = commandBus.subscribe(
      (nextBlueprint) => {
        set({
          blueprint: nextBlueprint,
          dirty: true,
        });
      }
    );
  },

  /* --------------------------------------------------------
     Internal Blueprint Update
     (Prefer CommandBus for mutations)
  -------------------------------------------------------- */

  setBlueprint(blueprint) {
    set({
      blueprint,
    });
  },

  /* --------------------------------------------------------
     Clipboard
  -------------------------------------------------------- */

  setClipboard(node) {
    set({
      clipboard: node,
    });
  },

  /* --------------------------------------------------------
     Dirty State
  -------------------------------------------------------- */

  markDirty() {
    set({
      dirty: true,
    });
  },

  clearDirty() {
    set({
      dirty: false,
    });
  },
}));