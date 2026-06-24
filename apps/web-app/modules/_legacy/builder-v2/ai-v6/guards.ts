import type { AIAction } from "./types";

/* ============================================================
   AI OUTPUT VALIDATION
============================================================ */

export function isValidAIAction(
  action: any
): action is AIAction {
  if (!action || typeof action !== "object") return false;
  if (typeof action.type !== "string") return false;

  switch (action.type) {
    case "insert-child":
      return Boolean(action.parentId && action.node);

    case "replace-node":
      return Boolean(action.nodeId && action.node);

    case "update-node":
      return Boolean(action.nodeId && action.patch);

    case "delete-node":
      return Boolean(action.nodeId);

    default:
      return false;
  }
}

export function filterValidActions(
  actions: any[] = []
): AIAction[] {
  return actions.filter(isValidAIAction);
}
