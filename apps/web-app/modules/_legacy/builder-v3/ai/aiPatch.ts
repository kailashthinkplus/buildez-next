// -------------------------------------------------------------
// aiPatch.ts — V3 Builder
// Apply AI-generated dot-notation patches to Blueprint trees
//
// CONTRACT:
// Patch = {
//   type: "update" | "insert" | "delete",
//   path: string,                // dot notation (e.g. "children.1.props.text")
//   value?: any,                 // for update / insert
//   index?: number               // for insert
// }
//
// IMPORTANT:
// - This file is PURE LOGIC
// - No React
// - No Zustand writes here
// - Store decides how to use it
// -------------------------------------------------------------

import { nanoid } from "nanoid";
import { BlueprintNode } from "@/modules/builder/blueprint/types";

/* ============================================================================
   PATH RESOLUTION
   ============================================================================ */

/**
 * Resolve a dot-notation path into { parent, key }
 * Example:
 *   path: "children.1.props.text"
 *   returns parent = props, key = "text"
 */
function resolvePath(
  root: any,
  path: string
): { parent: any; key: string | number } | null {
  if (!path || path === "root") {
    return { parent: root, key: "root" };
  }

  const parts = path.split(".");
  let current: any = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Skip literal "children"
    if (part === "children") continue;

    const idx = Number(part);
    if (!isNaN(idx)) {
      if (!Array.isArray(current.children)) return null;
      current = current.children[idx];
      if (!current) return null;
      continue;
    }

    if (current[part] == null) return null;
    current = current[part];
  }

  const last = parts[parts.length - 1];
  const num = Number(last);

  return {
    parent: current,
    key: isNaN(num) ? last : num,
  };
}

/* ============================================================================
   SINGLE PATCH EXECUTOR (PURE)
   ============================================================================ */

function applySinglePatch(
  root: BlueprintNode,
  patch: any
): BlueprintNode {
  const { type, path, value, index } = patch;
  if (!type || !path) return root;

  const resolved = resolvePath(root, path);
  if (!resolved) {
    console.warn("Patch path not found:", patch);
    return root;
  }

  const { parent, key } = resolved;

  switch (type) {
    /* ---------------------------------------------------------
       UPDATE
       --------------------------------------------------------- */
    case "update": {
      parent[key] = value;
      return root;
    }

    /* ---------------------------------------------------------
       DELETE
       --------------------------------------------------------- */
    case "delete": {
      if (Array.isArray(parent)) {
        const idx = Number(key);
        if (!isNaN(idx)) parent.splice(idx, 1);
      } else {
        delete parent[key];
      }
      return root;
    }

    /* ---------------------------------------------------------
       INSERT
       --------------------------------------------------------- */
    case "insert": {
      if (!Array.isArray(parent[key])) {
        parent[key] = [];
      }

      const node = {
        id: nanoid(),
        ...value,
      };

      const pos =
        typeof index === "number"
          ? Math.max(0, Math.min(index, parent[key].length))
          : parent[key].length;

      parent[key].splice(pos, 0, node);
      return root;
    }

    default:
      console.warn("Unknown patch type:", type);
      return root;
  }
}

/* ============================================================================
   PUBLIC API — APPLY PATCH LIST (PURE)
   ============================================================================ */

/**
 * Applies a list of AI patches to a BlueprintNode tree.
 * This function is PURE:
 * - No cloning
 * - No indexing
 * - No store access
 */
export function applyPatchesToTree(
  root: BlueprintNode,
  patches: any[]
): BlueprintNode {
  let current = root;

  for (const patch of patches) {
    try {
      current = applySinglePatch(current, patch);
    } catch (err) {
      console.error("Failed applying patch:", patch, err);
    }
  }

  return current;
}

/* ============================================================================
   END OF FILE — aiPatch.ts
   ============================================================================ */
