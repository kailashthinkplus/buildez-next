import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { writeBuilderClipboard } from "./builderClipboard";
import { clipboardFailure, clipboardSuccess, type ClipboardOperationResult, type BuilderNodeClipboardPayload } from "./clipboardTypes";

export function copyNodeToClipboard(
  blueprint: BuilderBlueprint,
  nodeId: string
): ClipboardOperationResult<BuilderNodeClipboardPayload> {
  const source = blueprint.nodes[nodeId];
  if (!source) {
    return clipboardFailure(["Source node does not exist."]);
  }

  const nodes: Record<string, BuilderNode> = {};
  collectSubtree(blueprint, nodeId, nodes);

  const payload: BuilderNodeClipboardPayload = Object.freeze({
    kind: "builder-node",
    rootId: nodeId,
    rootType: source.type,
    nodes,
    copiedAt: new Date().toISOString(),
  });

  writeBuilderClipboard(payload);
  return clipboardSuccess(payload);
}

function collectSubtree(
  blueprint: BuilderBlueprint,
  nodeId: string,
  nodes: Record<string, BuilderNode>
): void {
  const node = blueprint.nodes[nodeId];
  if (!node) return;

  nodes[nodeId] = structuredClone(node);

  for (const childId of node.children) {
    collectSubtree(blueprint, childId, nodes);
  }
}
