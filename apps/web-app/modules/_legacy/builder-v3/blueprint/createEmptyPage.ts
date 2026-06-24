// /Users/kailash/buildez/apps/web-app/modules/builder/blueprint/createEmptyPage.ts
"use client";

import { Blueprint, PageNode } from "./types";
import { NodeType } from "./types";

/**
 * Creates a new empty page for new tenant or new site pages.
 */
export function createEmptyPage(): Blueprint {
  const root: PageNode = {
    id: crypto.randomUUID(),
    type: NodeType.Page,
    props: {
      title: "Untitled Page",
      path: "/",
      spacing: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
      layout: { display: "flex", direction: "column", gap: 0 },
      style: {},
      responsive: {},
      effects: {},
    },
    children: [],
  };

  return {
    page: {
      id: root.id,
      tree: root,
    },
  };
}
