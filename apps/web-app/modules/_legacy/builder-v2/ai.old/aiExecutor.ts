// /Users/kailash/buildez/apps/web-app/modules/builder/ai/aiExecutor.ts

import { AIAction } from "./aiTypes";
import { BlueprintNode } from "../renderer/PageRenderer";

/* ============================================================
   AI ACTION EXECUTOR (CANONICAL)
   - Deterministic
   - Immutable
   - Blueprint-only
============================================================ */

/**
 * Apply AI actions to a Blueprint tree.
 * This function is PURE and returns a new tree.
 */
export function applyAIActions(
  blueprint: BlueprintNode,
  actions: AIAction[]
): BlueprintNode {
  const tree = structuredClone(blueprint);

  for (const action of actions) {
    switch (action.type) {
      case "update-node":
        updateNode(tree, action.nodeId, action.patch);
        break;

      case "replace-node":
        replaceNode(tree, action.nodeId, action.node);
        break;

      case "insert-child":
        insertChild(tree, action.parentId, action.node);
        break;

      case "delete-node":
        deleteNode(tree, action.nodeId);
        break;

      default:
        // Exhaustiveness guard
        console.warn("Unknown AI action", action);
        break;
    }
  }

  return tree;
}

/* ============================================================
   TREE WALKING HELPERS
============================================================ */

function walkTree(
  node: BlueprintNode,
  visitor: (node: BlueprintNode, parent?: BlueprintNode) => boolean | void,
  parent?: BlueprintNode
): boolean {
  const shouldStop = visitor(node, parent);
  if (shouldStop) return true;

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (walkTree(child, visitor, node)) return true;
    }
  }

  return false;
}

/* ============================================================
   ACTION IMPLEMENTATIONS
============================================================ */

function updateNode(
  root: BlueprintNode,
  nodeId: string,
  patch: Partial<BlueprintNode["props"]>
) {
  walkTree(root, (node) => {
    if (node.id === nodeId) {
      node.props = {
        ...node.props,
        ...patch,
      };
      return true;
    }
  });
}

function replaceNode(
  root: BlueprintNode,
  nodeId: string,
  newNode: BlueprintNode
) {
  walkTree(root, (node, parent) => {
    if (!parent || !parent.children) return;

    const index = parent.children.findIndex(
      (child) => child.id === nodeId
    );

    if (index !== -1) {
      parent.children[index] = newNode;
      return true;
    }
  });
}

function insertChild(
  root: BlueprintNode,
  parentId: string,
  node: BlueprintNode
) {
  walkTree(root, (current) => {
    if (current.id === parentId) {
      if (!Array.isArray(current.children)) {
        current.children = [];
      }

      current.children.push(node);
      return true;
    }
  });
}

function deleteNode(root: BlueprintNode, nodeId: string) {
  walkTree(root, (node, parent) => {
    if (!parent || !parent.children) return;

    const index = parent.children.findIndex(
      (child) => child.id === nodeId
    );

    if (index !== -1) {
      parent.children.splice(index, 1);
      return true;
    }
  });
}
