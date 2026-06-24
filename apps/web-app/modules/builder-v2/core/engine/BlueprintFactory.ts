import type {
  BuilderBlueprint,
  BuilderNode,
  NodeType,
} from "../../types/blueprint";

import { WidgetRegistry } from "../registry/WidgetRegistry";

/* ==========================================================
   Blueprint Factory
========================================================== */

export class BlueprintFactory {
  /* --------------------------------------------------------
     Empty Blueprint
  -------------------------------------------------------- */

  static createEmpty(): BuilderBlueprint {
    const page = this.createNode("page");

    return {
      metadata: {
        version: 2,
        title: "Untitled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      theme: {
        id: "default",
        name: "Default",
        preset: "default",
        tokens: {},
      },

      root: page.id,

      nodes: {
        [page.id]: page,
      },
    };
  }

  /* --------------------------------------------------------
     Create Widget Node
  -------------------------------------------------------- */

  static createNode(
    type: NodeType,
    parentId: string | null = null
  ): BuilderNode {
    const widget = WidgetRegistry.get(type);

    return {
      ...structuredClone(widget.defaultNode),

      id: crypto.randomUUID(),

      parentId,
    };
  }

  /* --------------------------------------------------------
     Clone Node
  -------------------------------------------------------- */

  static cloneNode(node: BuilderNode): BuilderNode {
    return {
      ...structuredClone(node),

      id: crypto.randomUUID(),

      children: [],
    };
  }
}

/* ==========================================================
   Backwards Compatibility
========================================================== */

export const createEmptyBlueprint =
  BlueprintFactory.createEmpty;