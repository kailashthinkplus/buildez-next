// ============================================================================
// applyPatch.ts — V3 Blueprint Patch Executor (FINAL)
// Pure, side-effect-free patch system for BlueprintNode trees.
// Supports: update, insert, delete using dot-notation paths.
// ============================================================================

import { BlueprintNode } from "./types";
import { BlueprintPatch } from "@/modules/builder/ai/AiTypes";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// Utility: deep clone
// ---------------------------------------------------------------------------
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Utility: safely get parent + key from dot-notation path
// Example: "children.2.props.text"
// Returns: { parentObject, key: "text" }
// ---------------------------------------------------------------------------
function resolvePath(
  root: any,
  path: string
): { parent: any; key: string | number; exists: boolean } {
  if (!path || path === "root") {
    return { parent: root, key: "root", exists: true };
  }

  const parts = path.split(".");
  let current: any = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Handle "children.X"
    if (part === "children") {
      const idx = Number(parts[++i]);
      if (!Array.isArray(current.children)) current.children = [];
      if (!current.children[idx]) current.children[idx] = {};
      current = current.children[idx];
      continue;
    }

    // Normal property
    if (current[part] == null) current[part] = {};
    current = current[part];
  }

  let key: string | number = parts[parts.length - 1];

  // final child index → number
  const numKey = Number(key);
  if (!isNaN(numKey)) key = numKey;

  return { parent: current, key, exists: true };
}

// ---------------------------------------------------------------------------
// UPDATE PATCH
// ---------------------------------------------------------------------------
function applyUpdate(root: BlueprintNode, patch: BlueprintPatch): BlueprintNode {
  const updated = deepClone(root);

  const { parent, key } = resolvePath(updated, patch.path);

  parent[key] = patch.value;

  return updated;
}

// ---------------------------------------------------------------------------
// INSERT PATCH
// Requires: patch.node (BlueprintNode)
// If target path is "children.3" → insert at array index
// ---------------------------------------------------------------------------
function applyInsert(root: BlueprintNode, patch: BlueprintPatch): BlueprintNode {
  if (!patch.node) {
    console.warn("❌ insert patch missing .node", patch);
    return root;
  }

  const newNode = deepClone(patch.node);

  // ensure unique ID
  if (!newNode.id) newNode.id = nanoid();

  const updated = deepClone(root);

  const { parent, key } = resolvePath(updated, patch.path);

  // If inserting into children array
  if (Array.isArray(parent)) {
    const index = Number(key);
    parent.splice(index, 0, newNode);
    return updated;
  }

  // If path ends in "children"
  if (parent.children && Array.isArray(parent.children)) {
    const idx = Number(key);
    if (!isNaN(idx)) {
      parent.children.splice(idx, 0, newNode);
    } else {
      parent.children.push(newNode);
    }
    return updated;
  }

  console.warn("⚠️ insert patch path not recognized:", patch.path);
  return updated;
}

// ---------------------------------------------------------------------------
// DELETE PATCH
// Supports deleting array child or object property
// ---------------------------------------------------------------------------
function applyDelete(root: BlueprintNode, patch: BlueprintPatch): BlueprintNode {
  const updated = deepClone(root);

  const parts = patch.path.split(".");
  const last = parts.pop()!;
  const lastKeyNum = Number(last);

  // Resolve parent
  const { parent } = resolvePath(updated, parts.join("."));

  // If deleting child index
  if (Array.isArray(parent)) {
    if (!isNaN(lastKeyNum)) {
      parent.splice(lastKeyNum, 1);
      return updated;
    }
  }

  // Delete object property
  delete parent[last];

  return updated;
}

// ---------------------------------------------------------------------------
// APPLY MULTIPLE PATCHES
// ---------------------------------------------------------------------------
export function applyPatches(
  root: BlueprintNode,
  patches: BlueprintPatch[]
): BlueprintNode {
  let current = deepClone(root);

  for (const patch of patches) {
    try {
      switch (patch.type) {
        case "update":
          current = applyUpdate(current, patch);
          break;

        case "insert":
          current = applyInsert(current, patch);
          break;

        case "delete":
          current = applyDelete(current, patch);
          break;

        default:
          console.warn("❌ Unknown patch type:", patch);
      }
    } catch (err) {
      console.error("❌ Patch failed:", patch, err);
    }
  }

  return current;
}
