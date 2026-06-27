import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { BuilderCommand } from "./BuilderCommand";

type ClipboardPayload = {
  rootId: string;
  nodes: Record<string, BuilderNode>;
};

const CLIPBOARD_KEY = "__builder_copied_node";

function readClipboard(): ClipboardPayload | null {
  try {
    const raw = sessionStorage.getItem(CLIPBOARD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClipboardPayload;
  } catch {
    return null;
  }
}

function writeClipboard(payload: ClipboardPayload): void {
  try {
    sessionStorage.setItem(CLIPBOARD_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures; command becomes no-op for persistence.
  }
}

export class CopyElementCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Copy Element";

  constructor(private readonly nodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const source = blueprint.nodes[this.nodeId];
    if (!source) return blueprint;

    const copiedNodes: Record<string, BuilderNode> = {};

    const collect = (id: string) => {
      const node = blueprint.nodes[id];
      if (!node) return;

      copiedNodes[id] = structuredClone(node);
      for (const childId of node.children) {
        collect(childId);
      }
    };

    collect(this.nodeId);

    writeClipboard({
      rootId: this.nodeId,
      nodes: copiedNodes,
    });

    return blueprint;
  }
}

export class PasteElementCommand implements BuilderCommand {
  readonly id = crypto.randomUUID();
  readonly name = "Paste Element";

  constructor(private readonly targetNodeId: string) {}

  execute(blueprint: BuilderBlueprint): BuilderBlueprint {
    const target = blueprint.nodes[this.targetNodeId];
    const payload = readClipboard();

    if (!target || !payload) return blueprint;

    const sourceRoot = payload.nodes[payload.rootId];
    if (!sourceRoot) return blueprint;

    const nodes = {
      ...blueprint.nodes,
    };

    const cloneRecursive = (sourceId: string, parentId: string | null): string | null => {
      const original = payload.nodes[sourceId];
      if (!original) return null;

      const newId = crypto.randomUUID();
      const cloned: BuilderNode = {
        ...structuredClone(original),
        id: newId,
        parentId,
        children: [],
      };

      nodes[newId] = cloned;

      for (const childId of original.children) {
        const clonedChildId = cloneRecursive(childId, newId);
        if (clonedChildId) {
          cloned.children.push(clonedChildId);
        }
      }

      return newId;
    };

    const newRootId = cloneRecursive(payload.rootId, null);
    if (!newRootId) return blueprint;

    let parentId: string;
    let insertIndex: number;

    if (target.parentId && nodes[target.parentId]) {
      const parent = nodes[target.parentId];
      parentId = parent.id;
      const targetIndex = parent.children.indexOf(target.id);
      insertIndex = targetIndex >= 0 ? targetIndex + 1 : parent.children.length;
    } else {
      parentId = target.id;
      insertIndex = target.children.length;
    }

    const parent = nodes[parentId];
    if (!parent) return blueprint;

    nodes[newRootId].parentId = parentId;
    parent.children = [...parent.children];
    parent.children.splice(insertIndex, 0, newRootId);

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
