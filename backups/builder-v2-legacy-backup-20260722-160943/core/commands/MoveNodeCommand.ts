import type {
  BuilderBlueprint,
  BuilderNode,
} from "../../types/blueprint";

import type { BuilderCommand } from "./BuilderCommand";

/* ==========================================================
   TYPES
========================================================== */

type NodePatch = Partial<Omit<BuilderNode, "id">>;

/* ==========================================================
   UPDATE NODE COMMAND
========================================================== */

export class UpdateNodeCommand implements BuilderCommand {
  id = crypto.randomUUID();

  name = "Update Node";

  constructor(
    private readonly nodeId: string,
    private readonly patch: NodePatch
  ) {}

  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint {

    const node = blueprint.nodes[this.nodeId];

    if (!node) {
      return blueprint;
    }

    /* --------------------------------------------------------
       Deep Merge
    -------------------------------------------------------- */

    const updatedNode: BuilderNode = {

      ...node,

      ...this.patch,

      props: sanitizeUndefinedObjectProperties({
        ...node.props,
        ...(this.patch.props ?? {}),
      }),

      style: sanitizeUndefinedObjectProperties({
        ...node.style,
        ...(this.patch.style ?? {}),
      }),

    };

    /* --------------------------------------------------------
       Immutable Blueprint
    -------------------------------------------------------- */

    return {

      ...blueprint,

      metadata: {

        ...blueprint.metadata,

        updatedAt: new Date().toISOString(),

      },

      nodes: {

        ...blueprint.nodes,

        [this.nodeId]: updatedNode,

      },

    };

  }
}

export function sanitizeUndefinedObjectProperties<T extends Record<string, unknown>>(
  value: T
): T {
  const next: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    if (Array.isArray(entry)) {
      // Arrays are structural. Preserve them exactly so validation can reject
      // undefined entries without shifting ordering or indexes.
      next[key] = [...entry];
      continue;
    }
    if (entry !== null && typeof entry === "object") {
      const cleaned = sanitizeUndefinedObjectProperties(
        entry as Record<string, unknown>
      );
      if (Object.keys(cleaned).length > 0) next[key] = cleaned;
      continue;
    }
    next[key] = entry;
  }
  return next as T;
}
