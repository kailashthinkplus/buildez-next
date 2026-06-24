import type { BuilderBlueprint } from "../../types/blueprint";

import type { BuilderCommand } from "./BuilderCommand";

export class ReorderNodeCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();

  readonly name = "Reorder Node";

  constructor(
    private readonly nodeId: string,
    private readonly direction: "up" | "down"
  ) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];

    if (!node || !node.parentId) {
      return blueprint;
    }

    const parent = blueprint.nodes[node.parentId];

    if (!parent) {
      return blueprint;
    }

    const currentIndex = parent.children.indexOf(this.nodeId);

    if (currentIndex < 0) {
      return blueprint;
    }

    const targetIndex =
      this.direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= parent.children.length) {
      return blueprint;
    }

    const nextChildren = [...parent.children];
    const [moved] = nextChildren.splice(currentIndex, 1);
    nextChildren.splice(targetIndex, 0, moved);

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [parent.id]: {
          ...parent,
          children: nextChildren,
        },
      },
    };
  }
}
