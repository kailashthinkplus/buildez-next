import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";
import { validateBlueprint } from "./validateBlueprint";

/**
 * 🔒 SINGLE SOURCE OF TRUTH BEFORE COMMIT
 *
 * RULES:
 * - MUST be deterministic
 * - MUST NOT create or destroy layout
 * - MUST NOT regenerate IDs
 * - MUST NOT re-wrap nodes
 * - MUST ONLY:
 *   • validate
 *   • freeze shape assumptions
 */
export function prepareBlueprintForCommit(
  blueprint: BlueprintNode
): BlueprintNode {
  // 1️⃣ Validate structure (hard fail if broken)
  validateBlueprint(blueprint);

  // 2️⃣ Deep freeze shape (no mutation allowed after this point)
  return deepFreezeBlueprint(blueprint);
}

/* ============================================================
   IMMUTABILITY ENFORCER (DEV + PROD SAFE)
============================================================ */

function deepFreezeBlueprint<T extends BlueprintNode>(node: T): T {
  if (node.children) {
    node.children.forEach(deepFreezeBlueprint);
  }

  return Object.freeze(node);
}
