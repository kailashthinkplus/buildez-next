// /modules/builder/blueprint/loadBlueprint.ts
"use client";

import { PageNode } from "./types";
import { mapNode } from "./mapper";
import { hydrateBlueprint } from "./hydrateBlueprint";

/**
 * Load a raw PageNode (from DB or API)
 * → hydrate missing fields from presets
 * → apply mapper merge logic
 */
export function loadBlueprint(raw: PageNode): PageNode {
  if (!raw) {
    throw new Error("loadBlueprint: raw PageNode is undefined or null");
  }

  // Step 1 — ensure all missing props/children are injected
  const hydrated = hydrateBlueprint(raw);

  // Step 2 — merge with presets (Base or Advanced)
  const mapped = mapNode(hydrated);

  return mapped;
}
