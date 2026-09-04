import type { BuilderBlueprint } from "../../types/blueprint";
import { isAllowedChildRelationship } from "../validation/blueprintSchema";
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
    if (this.nodeId === this.newParentId) return false;
    if (!isAllowedChildRelationship(parent.type, node.type)) return false;

    // Prevent cyclical parenting (cannot move a node into its own descendant).
    let cursor: string | null = this.newParentId;
    while (cursor) {
      if (cursor === this.nodeId) {
        return false;
      }
      const current = blueprint.nodes[cursor];
      cursor = current?.parentId ?? null;
    }

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

    if (!canHaveChildren) {
      return false;
    }

    /*
     * A same-parent reparent can be a structural no-op. Compute the
     * effective final sibling order after removing the moving node and
     * applying the requested insertion index. If the order is unchanged,
     * do not create a command/history entry or mark the Builder dirty.
     */
    if (node.parentId === parent.id) {
      const normalizedChildren =
        parent.children.filter(
          (childId) => childId !== this.nodeId
        );

      const insertIdx =
        this.insertIndex === undefined
          ? normalizedChildren.length
          : Math.max(
              0,
              Math.min(
                this.insertIndex,
                normalizedChildren.length
              )
            );

      const nextChildren = [...normalizedChildren];
      nextChildren.splice(
        insertIdx,
        0,
        this.nodeId
      );

      const unchanged =
        nextChildren.length === parent.children.length &&
        nextChildren.every(
          (childId, index) =>
            childId === parent.children[index]
        );

      if (unchanged) {
        return false;
      }
    }

    return true;
  }

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];
    const newParent = blueprint.nodes[this.newParentId];
    const oldParent = node?.parentId ? blueprint.nodes[node.parentId] : null;

    if (!node || !newParent) {
      return blueprint;
    }

    if (this.nodeId === this.newParentId) {
      return blueprint;
    }

    if (!isAllowedChildRelationship(newParent.type, node.type)) {
      return blueprint;
    }

    /*
     * Keep execute() independently safe even when called outside a
     * CommandBus implementation that checks canExecute().
     */
    if (oldParent?.id === newParent.id) {
      const normalizedChildren =
        newParent.children.filter(
          (childId) => childId !== this.nodeId
        );

      const insertIdx =
        this.insertIndex === undefined
          ? normalizedChildren.length
          : Math.max(
              0,
              Math.min(
                this.insertIndex,
                normalizedChildren.length
              )
            );

      const nextChildren = [...normalizedChildren];
      nextChildren.splice(
        insertIdx,
        0,
        this.nodeId
      );

      const unchanged =
        nextChildren.length === newParent.children.length &&
        nextChildren.every(
          (childId, index) =>
            childId === newParent.children[index]
        );

      if (unchanged) {
        return blueprint;
      }
    }

    let cursor: string | null = this.newParentId;
    while (cursor) {
      if (cursor === this.nodeId) {
        return blueprint;
      }
      const current = blueprint.nodes[cursor];
      cursor = current?.parentId ?? null;
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
    const normalizedTargetChildren =
      oldParent?.id === newParent.id
        ? newParent.children.filter((id) => id !== this.nodeId)
        : [...newParent.children];

    const insertIdx =
      this.insertIndex === undefined
        ? normalizedTargetChildren.length
        : Math.max(0, Math.min(this.insertIndex, normalizedTargetChildren.length));

    const newChildren = [...normalizedTargetChildren];
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
