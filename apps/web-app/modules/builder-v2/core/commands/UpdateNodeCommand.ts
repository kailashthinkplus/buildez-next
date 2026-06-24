import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

export class MoveNodeCommand implements BuilderCommand {
  id = crypto.randomUUID();

  name = "Move Node";

  constructor(
    private readonly nodeId: string,
    private readonly newParentId: string,
    private readonly newIndex: number
  ) {}

  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint {

    const node = blueprint.nodes[this.nodeId];

    if (!node) {
      return blueprint;
    }

    // Never move root page
    if (node.parentId === null) {
      return blueprint;
    }

    const oldParent = blueprint.nodes[node.parentId];
    const newParent = blueprint.nodes[this.newParentId];

    if (!oldParent || !newParent) {
      return blueprint;
    }

    // Remove from old parent
    oldParent.children = oldParent.children.filter(
      (id) => id !== this.nodeId
    );

    // Clamp insertion index
    const index = Math.max(
      0,
      Math.min(this.newIndex, newParent.children.length)
    );

    // Insert into new parent
    newParent.children.splice(
      index,
      0,
      this.nodeId
    );

    // Update parent reference
    node.parentId = this.newParentId;

    blueprint.metadata.updatedAt =
      new Date().toISOString();

    return blueprint;
  }
}