import type {
  BuilderBlueprint,
  BuilderNode,
} from "../../types/blueprint";

import type { BuilderCommand } from "./BuilderCommand";

/* ==========================================================
   Duplicate Node Command
========================================================== */

export class DuplicateNodeCommand
  implements BuilderCommand
{
  readonly id = crypto.randomUUID();

  readonly name = "Duplicate Node";

  constructor(
    private readonly nodeId: string
  ) {}

  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint {

    const source =
      blueprint.nodes[this.nodeId];

    if (!source) {
      return blueprint;
    }

    const nodes = {
      ...blueprint.nodes,
    };

    const cloneRecursive = (
      id: string,
      parentId: string | null
    ): string => {

      const original = blueprint.nodes[id];

      const newId = crypto.randomUUID();

      const childIds: string[] = [];

      nodes[newId] = {
        ...original,
        id: newId,
        parentId,
        children: childIds,
      };

      for (const child of original.children) {
        const duplicated =
          cloneRecursive(child, newId);

        childIds.push(duplicated);
      }

      return newId;
    };

    const duplicatedId =
      cloneRecursive(
        source.id,
        source.parentId
      );

    if (source.parentId) {

      const parent =
        nodes[source.parentId];

      const index =
        parent.children.indexOf(source.id);

      const children = [
        ...parent.children,
      ];

      children.splice(
        index + 1,
        0,
        duplicatedId
      );

      nodes[parent.id] = {
        ...parent,
        children,
      };

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