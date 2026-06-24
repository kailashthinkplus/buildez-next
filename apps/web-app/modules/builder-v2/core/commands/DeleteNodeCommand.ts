import type {
  BuilderBlueprint,
} from "../../types/blueprint";

import type { BuilderCommand } from "./BuilderCommand";

/* ==========================================================
   Delete Node Command
========================================================== */

export class DeleteNodeCommand
  implements BuilderCommand
{
  readonly id = crypto.randomUUID();

  readonly name = "Delete Node";

  constructor(
    private readonly nodeId: string
  ) {}

  canExecute(
    blueprint: BuilderBlueprint
  ): boolean {
    return (
      this.nodeId !== blueprint.root &&
      this.nodeId in blueprint.nodes
    );
  }

  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint {

    const node =
      blueprint.nodes[this.nodeId];

    if (!node) {
      return blueprint;
    }

    const nodes = {
      ...blueprint.nodes,
    };

    /* ----------------------------------
       Remove descendants
    ----------------------------------- */

    const remove = (id: string) => {
      const current = nodes[id];

      if (!current) return;

      for (const childId of current.children) {
        remove(childId);
      }

      delete nodes[id];
    };

    remove(this.nodeId);

    /* ----------------------------------
       Remove from parent
    ----------------------------------- */

    if (node.parentId) {

      const parent =
        nodes[node.parentId];

      if (parent) {

        nodes[parent.id] = {

          ...parent,

          children:
            parent.children.filter(
              id => id !== this.nodeId
            ),

        };

      }

    }

    return {

      ...blueprint,

      metadata: {

        ...blueprint.metadata,

        updatedAt:
          new Date().toISOString(),

      },

      nodes,

    };

  }
}