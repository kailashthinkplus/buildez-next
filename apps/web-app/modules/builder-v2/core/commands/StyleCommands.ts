import type { BuilderBlueprint, BuilderStyle } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

export class CopyStyleCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Copy Style";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];

    if (!node) {
      return blueprint;
    }

    const style = node.style || {};

    try {
      sessionStorage.setItem("__builder_copied_style", JSON.stringify(style));
    } catch (e) {
      console.warn("Failed to copy style to sessionStorage", e);
    }

    return blueprint;
  }
}

export class PasteStyleCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Paste Style";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const node = blueprint.nodes[this.nodeId];

    if (!node) {
      return blueprint;
    }

    let copiedStyle: Partial<BuilderStyle> = {};

    try {
      const raw = sessionStorage.getItem("__builder_copied_style");
      if (raw) {
        copiedStyle = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to retrieve copied style", e);
    }

    if (!Object.keys(copiedStyle).length) {
      return blueprint;
    }

    const updatedNode = {
      ...node,
      style: {
        ...node.style,
        ...copiedStyle,
      },
    };

    return {
      ...blueprint,
      metadata: {
        ...blueprint.metadata,
        updatedAt: new Date().toISOString(),
      },
      nodes: {
        ...blueprint.nodes,
        [this.nodeId]: updatedNode,
      },
    };
  }
}
