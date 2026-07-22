import type { BuilderBlueprint } from "../../types/blueprint";
import { validateBlueprint } from "../validation";
import { readBuilderStyleClipboard } from "./builderClipboard";
import { filterStyleForTarget } from "./clipboardValidation";
import { clipboardFailure, clipboardSuccess, type ClipboardOperationResult } from "./clipboardTypes";

export function pasteStyleFromClipboard(
  blueprint: BuilderBlueprint,
  nodeId: string
): ClipboardOperationResult<BuilderBlueprint> {
  const payload = readBuilderStyleClipboard();
  if (!payload) return clipboardFailure(["No copied style is available."]);

  const node = blueprint.nodes[nodeId];
  if (!node) return clipboardFailure(["Target node does not exist."]);

  const filtered = filterStyleForTarget(payload.style, payload.sourceType, node.type);
  if (!filtered.compatible) {
    return clipboardFailure(["Copied style is not compatible with target node."]);
  }

  const next: BuilderBlueprint = {
    ...blueprint,
    metadata: {
      ...blueprint.metadata,
      updatedAt: new Date().toISOString(),
    },
    nodes: {
      ...blueprint.nodes,
      [node.id]: {
        ...node,
        style: {
          ...node.style,
          ...filtered.style,
        },
      },
    },
  };
  const validation = validateBlueprint(next);
  if (!validation.valid) {
    return clipboardFailure(validation.issues.map((issue) => issue.code));
  }

  return clipboardSuccess(next);
}
