// -------------------------------------------------------------
// AdvancedMapper.ts
// Heavy, rule-based, responsive-aware deep merging.
// Enabled only when BUILDEZ_ADVANCED_MAPPER=1
// -------------------------------------------------------------

import { BlueprintNode } from "./types";
import { PresetRegistry } from "./registry";

// -------- Deep Merge with full recursion --------
function deepMergeFull(target: any, source: any): any {
  if (source === null || source === undefined) return target;

  const out: any = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    const v = source[key];

    if (Array.isArray(v)) {
      out[key] = [...v];
    } else if (v && typeof v === "object") {
      out[key] = deepMergeFull(out[key] || {}, v);
    } else {
      out[key] = v;
    }
  }

  return out;
}

// -------- Responsive Merge --------
function mergeResponsive(base: any, overrides: any) {
  return deepMergeFull(base, overrides || {});
}

// -------- Advanced Mapper --------
export function advancedMapNode<T extends BlueprintNode>(node: T): T {
  const preset = PresetRegistry[node.type];
  if (!preset) {
    throw new Error(`AdvancedMapper: No preset for NodeType ${node.type}`);
  }

  const presetNode = preset.create();

  let props = deepMergeFull(presetNode.props, node.props || {});

  if (props.responsive) {
    props = {
      ...props,
      responsive: mergeResponsive(
        presetNode.props.responsive || {},
        node.props?.responsive || {}
      ),
    };
  }

  const mappedChildren =
    node.children?.map((c: any) => advancedMapNode(c)) ?? [];

  return {
    ...node,
    props,
    children: mappedChildren,
  };
}

export const AdvancedMapper = { mapNode: advancedMapNode };
