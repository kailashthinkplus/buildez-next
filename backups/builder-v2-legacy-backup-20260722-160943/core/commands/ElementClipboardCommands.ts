import type { BuilderBlueprint } from "../../types/blueprint";
import { copyNodeToClipboard, pasteNodeFromClipboard } from "../clipboard";
import type { BuilderCommand } from "./BuilderCommand";

export class CopyElementCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Copy Element";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    copyNodeToClipboard(blueprint, this.nodeId);
    return blueprint;
  }
}

export class PasteElementCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Paste Element";
  private pastedRootId: string | null = null;

  constructor(private readonly targetNodeId: string) {}

  getCreatedNodeId(): string | null {
    return this.pastedRootId;
  }

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    this.pastedRootId = null;
    const result = pasteNodeFromClipboard(blueprint, this.targetNodeId);
    if (!result.ok) return blueprint;

    const createdIds = Object.keys(result.value.nodes).filter(
      (nodeId) => !(nodeId in blueprint.nodes)
    );
    this.pastedRootId =
      createdIds.find((nodeId) => result.value.nodes[nodeId]?.parentId !== null) ?? null;
    return result.value;
  }
}
