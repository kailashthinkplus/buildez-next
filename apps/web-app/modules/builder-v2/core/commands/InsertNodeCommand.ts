import type {
  BuilderBlueprint,
  BuilderNode,
} from "../../types/blueprint";

import type { BuilderCommand } from "./BuilderCommand";

export class InsertNodeCommand implements BuilderCommand {
  id = crypto.randomUUID();

  name = "Insert Node";

  constructor(
    private readonly parentId: string,
    private readonly node: BuilderNode,
    private readonly index?: number
  ) {}

  execute(
    blueprint: BuilderBlueprint
  ): BuilderBlueprint {

    const parent =
      blueprint.nodes[this.parentId];

    if (!parent) {
      return blueprint;
    }

    // Parent must exist before insertion
    this.node.parentId = this.parentId;

    blueprint.nodes[this.node.id] = this.node;

    const insertIndex =
      this.index === undefined
        ? parent.children.length
        : Math.max(
            0,
            Math.min(
              this.index,
              parent.children.length
            )
          );

    parent.children.splice(
      insertIndex,
      0,
      this.node.id
    );

    blueprint.metadata.updatedAt =
      new Date().toISOString();

    return blueprint;
  }
}