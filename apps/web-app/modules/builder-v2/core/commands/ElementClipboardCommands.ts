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

  constructor(private readonly targetNodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const result = pasteNodeFromClipboard(blueprint, this.targetNodeId);
    return result.ok ? result.value : blueprint;
  }
}
