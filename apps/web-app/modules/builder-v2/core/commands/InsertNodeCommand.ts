import type {
  BuilderBlueprint,
  BuilderNode,
} from "../../types/blueprint";

import { isAllowedChildRelationship } from "../validation/blueprintSchema";
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

    if (!isAllowedChildRelationship(parent.type, this.node.type)) {
      console.warn("[Builder] InsertNodeCommand rejected invalid hierarchy", {
        parentId: parent.id,
        parentType: parent.type,
        childId: this.node.id,
        childType: this.node.type,
      });
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
