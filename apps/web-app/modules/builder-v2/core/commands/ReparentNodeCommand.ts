import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

export class ReparentNodeCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Reparent Node";

  constructor(
    private readonly nodeId: string,
    private readonly newParentId: string,
    private readonly insertIndex?: number
  ) {}

  canExecute(blueprint: BuilderBlueprint): boolean {
    const node = blueprint.nodes[this.nodeId];
    const parent = blueprint.nodes[this.newParentId];

    if (!node || !parent) return false;

    const canHaveChildren = [
      "page",
      "section",
      "container",
      "column",
      "grid",
      "hero",
      "features",
      "pricing",
      "gallery",
      "faq",
      "cta",
      "footer",
      "custom",
    ].includes(parent.type);

    return canHaveChildren;
  }

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];
    const newParent = blueprint.nodes[this.newParentId];
    const oldParent = node?.parentId ? blueprint.nodes[node.parentId] : null;

    if (!node || !newParent) {
      return blueprint;
    }

    const nodes = { ...blueprint.nodes };

    // Remove from old parent
    if (oldParent) {
      nodes[oldParent.id] = {
        ...oldParent,
        children: oldParent.children.filter((id) => id !== this.nodeId),
      };
    }

    // Add to new parent
    const insertIdx =
      this.insertIndex === undefined
        ? newParent.children.length
        : Math.max(0, Math.min(this.insertIndex, newParent.children.length));

    const newChildren = [...newParent.children];
    newChildren.splice(insertIdx, 0, this.nodeId);

    nodes[newParent.id] = {
      ...newParent,
      children: newChildren,
    };

    // Update node's parentId
    nodes[this.nodeId] = {
      ...node,
      parentId: this.newParentId,
    };

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes,
    };
  }
}
