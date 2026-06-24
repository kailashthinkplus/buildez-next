import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

export type AIPatch = {
  type: "update" | "insert" | "delete";
  path?: string;          // dot-path
  value?: any;
  node?: any;
  targetId?: string;
};

/* ============================================================
   APPLY AI PATCH (BUILDEZ CANONICAL)
============================================================ */

export function applyPatch(
  root: BlueprintNode,
  patch: AIPatch
): BlueprintNode {
  const next = structuredClone(root);

  // ----------------------------------------------------------
  // DELETE by targetId (preferred)
  // ----------------------------------------------------------
  if (patch.type === "delete" && patch.targetId) {
    return removeNodeById(next, patch.targetId);
  }

  // ----------------------------------------------------------
  // PATH-BASED OPERATIONS
  // ----------------------------------------------------------
  if (!patch.path) return next;

  const segments = patch.path.split(".").map((s) =>
    /^\d+$/.test(s) ? Number(s) : s
  );

  let target: any = next;
  const key = segments.pop();

  for (const seg of segments) {
    if (target == null) return next;
    target = target[seg as any];
  }

  if (target == null || key == null) return next;

  switch (patch.type) {
    case "update": {
      target[key as any] = patch.value;
      break;
    }

    case "insert": {
      if (Array.isArray(target[key as any])) {
        target[key as any].push(patch.node);
      } else {
        target[key as any] = patch.node;
      }
      break;
    }

    case "delete": {
      if (Array.isArray(target)) {
        const index = Number(key);
        if (!Number.isNaN(index)) target.splice(index, 1);
      } else {
        delete target[key as any];
      }
      break;
    }
  }

  return next;
}

/* ============================================================
   HELPERS
============================================================ */

function removeNodeById(
  node: BlueprintNode,
  id: string
): BlueprintNode {
  if (!node.children) return node;

  return {
    ...node,
    children: node.children
      .filter((c) => c.id !== id)
      .map((c) => removeNodeById(c, id)),
  };
}
