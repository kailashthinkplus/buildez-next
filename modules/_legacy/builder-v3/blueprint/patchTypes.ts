// -------------------------------------------------------------
// applyPatch.ts — V3 Blueprint Patch Executor (Production-Grade)
// -------------------------------------------------------------
import {
  BlueprintNode,
  NodeProps,
  BlueprintPath,
} from "./types";
import {
  BlueprintPatch,
  UpdatePatch,
  InsertPatch,
  DeletePatch,
  MovePatch,
} from "./patchTypes";
import { deepClone } from "./utils/deepClone";

// -----------------------------------------------------------------------------
// DOT-NOTATION RESOLVER
// -----------------------------------------------------------------------------
function setByDotPath(target: any, path: string, value: any) {
  const parts = path.split(".");
  let obj = target;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
    obj = obj[key];
  }

  obj[parts[parts.length - 1]] = value;
}

// -----------------------------------------------------------------------------
// FIND NODE + PARENT
// -----------------------------------------------------------------------------
function findNodeRecursive(
  node: BlueprintNode,
  targetId: string,
  parent: BlueprintNode | null = null
): { node: BlueprintNode; parent: BlueprintNode | null } | null {
  if (node.id === targetId) return { node, parent };

  for (const child of node.children) {
    const res = findNodeRecursive(child, targetId, node);
    if (res) return res;
  }

  return null;
}

// -----------------------------------------------------------------------------
// PATCH: UPDATE NODE
// -----------------------------------------------------------------------------
function applyUpdate(root: BlueprintNode, patch: UpdatePatch): BlueprintNode {
  const cloned = deepClone(root);

  function walk(n: BlueprintNode) {
    if (n.id === patch.targetId) {
      if (patch.path) {
        // update specific path e.g. props.style.fontSize
        setByDotPath(n, patch.path, patch.value);
      } else {
        // deep merge props
        n.props = { ...n.props, ...patch.value };
      }
    } else {
      n.children?.forEach(walk);
    }
  }

  walk(cloned);
  return cloned;
}

// -----------------------------------------------------------------------------
// PATCH: DELETE NODE
// -----------------------------------------------------------------------------
function applyDelete(root: BlueprintNode, patch: DeletePatch): BlueprintNode {
  const cloned = deepClone(root);

  function walk(node: BlueprintNode): BlueprintNode {
    const filtered = node.children
      .filter((c) => c.id !== patch.targetId)
      .map(walk);

    return { ...node, children: filtered };
  }

  return walk(cloned);
}

// -----------------------------------------------------------------------------
// PATCH: INSERT NODE
// -----------------------------------------------------------------------------
function applyInsert(root: BlueprintNode, patch: InsertPatch): BlueprintNode {
  const cloned = deepClone(root);
  const found = findNodeRecursive(cloned, patch.parentId);
  if (!found) return cloned;

  const parent = found.node;
  const index = Math.max(0, Math.min(patch.index, parent.children.length));

  parent.children.splice(index, 0, patch.node);
  return cloned;
}

// -----------------------------------------------------------------------------
// PATCH: MOVE NODE
// -----------------------------------------------------------------------------
function applyMove(root: BlueprintNode, patch: MovePatch): BlueprintNode {
  const cloned = deepClone(root);

  let extractedNode: BlueprintNode | null = null;

  // Step 1 — extract
  function extract(node: BlueprintNode): BlueprintNode {
    const newChildren: BlueprintNode[] = [];

    for (const child of node.children) {
      if (child.id === patch.targetId) {
        extractedNode = child;
      } else {
        newChildren.push(extract(child));
      }
    }

    return { ...node, children: newChildren };
  }

  const withoutNode = extract(cloned);
  if (!extractedNode) return cloned;

  // Step 2 — insert into new parent
  const parentMeta = findNodeRecursive(withoutNode, patch.newParentId);
  if (!parentMeta) return withoutNode;

  const { node: parent } = parentMeta;
  const insertIndex = Math.max(
    0,
    Math.min(patch.newIndex, parent.children.length)
  );

  parent.children.splice(insertIndex, 0, extractedNode);

  return withoutNode;
}

// -----------------------------------------------------------------------------
// MAIN applyPatches()
// -----------------------------------------------------------------------------
export function applyPatches(
  root: BlueprintNode,
  patches: BlueprintPatch[]
): BlueprintNode {
  let working = deepClone(root);

  for (const patch of patches) {
    try {
      switch (patch.type) {
        case "update":
          working = applyUpdate(working, patch);
          break;

        case "insert":
          working = applyInsert(working, patch);
          break;

        case "delete":
          working = applyDelete(working, patch);
          break;

        case "move":
          working = applyMove(working, patch);
          break;
      }
    } catch (err) {
      console.error("❌ Patch failed:", patch, err);
    }
  }

  return working;
}

