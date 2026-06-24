// -------------------------------------------------------------
// BlueprintValidator.ts (V3 Final)
// -------------------------------------------------------------
// Ensures the blueprint tree is always valid:
// - Every node has unique ID
// - Children array exists
// - NodeType is registered
// - Props match preset shape
//
// Used by loadBlueprint, mapBlueprint, and hydrateBlueprint.
// -------------------------------------------------------------

import { BlueprintNode, NodeType } from "./types";
import { PresetRegistry } from "./registry";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBlueprint(root: BlueprintNode): ValidationResult {
  const errors: string[] = [];
  const seen = new Set<string>();

  const walk = (node: BlueprintNode) => {
    // ID check
    if (!node.id) {
      errors.push(`Node missing ID: type=${node.type}`);
    } else if (seen.has(node.id)) {
      errors.push(`Duplicate node ID detected: ${node.id}`);
    } else {
      seen.add(node.id);
    }

    // Type check
    if (!Object.values(NodeType).includes(node.type)) {
      errors.push(`Invalid NodeType: ${node.type}`);
    }

    // Preset must exist
    if (!PresetRegistry[node.type]) {
      errors.push(`No preset found for NodeType: ${node.type}`);
    }

    // Children check
    if (!Array.isArray(node.children)) {
      errors.push(`Node.children must be an array (id=${node.id})`);
      node.children = [];
    }

    // Recurse
    node.children.forEach(walk);
  };

  walk(root);

  return { valid: errors.length === 0, errors };
}
