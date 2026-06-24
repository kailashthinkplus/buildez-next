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

      props: {
        ...node.props,
        ...(this.patch.props ?? {}),
      },

      style: {
        ...node.style,
        ...(this.patch.style ?? {}),
      },

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