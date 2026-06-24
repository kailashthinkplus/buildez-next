// -------------------------------------------------------------
// BaseMapper.ts
// Fast, stable, minimal merging.
// Default mapper for BuilderCanvas + Preview + Inspector.
// -------------------------------------------------------------

import { BlueprintNode } from "./types";
import { PresetRegistry } from "./registry";

// -------- Utility: Deep Merge (minimal, safe) --------
function deepMerge(target: any, source: any) {
  if (source === null || source === undefined) return target;

  const output = { ...target };

  for (const key in source) {
    const value = source[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMerge(target[key] || {}, value);
    } else {
      output[key] = value;
    }
  }

  return output;
}

// -------- Base Mapper --------
export function baseMapNode<T extends BlueprintNode>(node: T): T {
  const preset = PresetRegistry[node.type];
  if (!preset) {
    throw new Error(`BaseMapper: No preset found for NodeType ${node.type}`);
  }

  const presetNode = preset.create();

  const mergedProps = deepMerge(presetNode.props, node.props || {});

  const mappedChildren =
    node.children?.map((child: any) => baseMapNode(child)) ?? [];

  return {
    ...node,
    props: mergedProps,
    children: mappedChildren,
  };
}

// For completeness
export const BaseMapper = { mapNode: baseMapNode };
