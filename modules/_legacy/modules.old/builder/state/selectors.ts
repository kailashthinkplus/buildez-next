"use client";

import { useBlueprintStore } from "./useBlueprintStore";

// ------------------------------
// STABLE SELECTOR for sections
// ------------------------------
export const useSections = () =>
  useBlueprintStore((state) => {
    const bp = state.blueprint;
    if (!bp || !bp.pages) return undefined;

    const page = bp.currentPage || "home";
    return bp.pages[page]?.sections;
  });
