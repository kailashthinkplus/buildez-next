import type { BuilderBlueprint } from "../../types/blueprint";
import { validateBlueprint } from "../validation";
import type { BuilderCommand } from "./BuilderCommand";

export class ReorderNodeCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();

  readonly name = "Reorder Node";

  constructor(
    private readonly nodeId: string,
    private readonly directionOrIndex: "up" | "down" | number
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

    const targetIndex = this.resolveTargetIndex(currentIndex, parent.children.length);

    if (targetIndex < 0 || targetIndex >= parent.children.length || targetIndex === currentIndex) {
      return blueprint;
    }

    const nextChildren = [...parent.children];
    const [moved] = nextChildren.splice(currentIndex, 1);
    nextChildren.splice(targetIndex, 0, moved);

    const next: BuilderBlueprint = {
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

    return validateBlueprint(next).valid ? next : blueprint;
  }

  private resolveTargetIndex(currentIndex: number, siblingCount: number): number {
    if (this.directionOrIndex === "up") return currentIndex - 1;
    if (this.directionOrIndex === "down") return currentIndex + 1;
    return Math.max(0, Math.min(this.directionOrIndex, siblingCount - 1));
  }
}
