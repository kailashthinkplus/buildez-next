// /Users/kailash/buildez/apps/web-app/modules/builder/blueprint/mapBlueprint.ts
"use client";

import { Blueprint } from "./types";
import { mapNode } from "./mapper";

/**
 * Public helper — maps all nodes in a Blueprint
 */
export function mapBlueprint(bp: Blueprint): Blueprint {
  if (!bp?.page?.tree) return bp;

  return {
    ...bp,
    page: {
      ...bp.page,
      tree: mapNode(bp.page.tree),
    },
  };
}
