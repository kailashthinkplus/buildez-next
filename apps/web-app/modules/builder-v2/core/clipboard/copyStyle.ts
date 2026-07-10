import type { BuilderBlueprint } from "../../types/blueprint";
import { writeBuilderClipboard } from "./builderClipboard";
import { clipboardFailure, clipboardSuccess, type BuilderStyleClipboardPayload, type ClipboardOperationResult } from "./clipboardTypes";

export function copyStyleToClipboard(
  blueprint: BuilderBlueprint,
  nodeId: string
): ClipboardOperationResult<BuilderStyleClipboardPayload> {
  const node = blueprint.nodes[nodeId];
  if (!node) return clipboardFailure(["Source node does not exist."]);

  const payload: BuilderStyleClipboardPayload = Object.freeze({
    kind: "builder-style",
    sourceType: node.type,
    style: structuredClone(node.style ?? {}),
    copiedAt: new Date().toISOString(),
  });

  writeBuilderClipboard(payload);
  return clipboardSuccess(payload);
}
