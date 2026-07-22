import type { BuilderBlueprint } from "../../types/blueprint";
import { copyStyleToClipboard, pasteStyleFromClipboard } from "../clipboard";
import type { BuilderCommand } from "./BuilderCommand";

export class CopyStyleCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Copy Style";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    copyStyleToClipboard(blueprint, this.nodeId);
    return blueprint;
  }
}

export class PasteStyleCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Paste Style";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const result = pasteStyleFromClipboard(blueprint, this.nodeId);
    return result.ok ? result.value : blueprint;
  }
}
