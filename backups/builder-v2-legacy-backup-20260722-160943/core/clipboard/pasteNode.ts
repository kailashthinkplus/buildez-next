import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import { validateBlueprint } from "../validation";
import { readBuilderNodeClipboard } from "./builderClipboard";
import { findPasteParent } from "./clipboardValidation";
import { clipboardFailure, clipboardSuccess, type ClipboardOperationResult } from "./clipboardTypes";

export function pasteNodeFromClipboard(
  blueprint: BuilderBlueprint,
  targetNodeId: string
): ClipboardOperationResult<BuilderBlueprint> {
  const payload = readBuilderNodeClipboard();
  if (!payload) return clipboardFailure(["No copied node is available."]);

  const pasteTarget = findPasteParent(blueprint, targetNodeId, payload);
  if (!pasteTarget) return clipboardFailure(["Copied node is not compatible with the paste target."]);

  const sourceRoot = payload.nodes[payload.rootId];
  if (!sourceRoot) return clipboardFailure(["Copied node payload is missing its root."]);

  const nodes = { ...blueprint.nodes };
  const newRootId = cloneSubtree(payload.rootId, pasteTarget.parentId, payload.nodes, nodes);
  const parent = nodes[pasteTarget.parentId];

  if (!newRootId || !parent) {
    return clipboardFailure(["Could not clone copied node."]);
  }

  nodes[parent.id] = {
    ...parent,
    children: insertAt(parent.children, newRootId, pasteTarget.insertIndex),
  };

  const next: BuilderBlueprint = {
    ...blueprint,
    metadata: {
      ...blueprint.metadata,
      updatedAt: new Date().toISOString(),
    },
    nodes,
  };
  const validation = validateBlueprint(next);
  if (!validation.valid) {
    return clipboardFailure(validation.issues.map((issue) => issue.code));
  }

  return clipboardSuccess(next);
}

function cloneSubtree(
  sourceId: string,
  parentId: string | null,
  sourceNodes: Record<string, BuilderNode>,
  targetNodes: Record<string, BuilderNode>
): string | null {
  const original = sourceNodes[sourceId];
  if (!original) return null;

  const newId = crypto.randomUUID();
  const cloned: BuilderNode = {
    ...structuredClone(original),
    id: newId,
    parentId,
    children: [],
  };

  targetNodes[newId] = cloned;

  for (const childId of original.children) {
    const clonedChildId = cloneSubtree(childId, newId, sourceNodes, targetNodes);
    if (clonedChildId) cloned.children.push(clonedChildId);
  }

  return newId;
}

function insertAt(children: string[], childId: string, index: number) {
  const next = [...children];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, childId);
  return next;
}
