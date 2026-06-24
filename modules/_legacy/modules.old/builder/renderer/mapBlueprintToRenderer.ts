"use client";

import { BuilderNode } from "@/modules/builder/state/useBlueprintStore";
import { RendererNode } from "./rendererTypes";
import { cn } from "@/modules/builder/utils/cn";
import { getDevice } from "@/modules/builder/state/getDevice"; // optional selector

/**
 * -------------------------------------------------------------------
 * V3 DEFAULT WIDGET PROPS (minimal)
 * -------------------------------------------------------------------
 * You can extend this any time.
 */
const DEFAULT_PROPS: Record<string, any> = {
  page: {},
  section: { padding: "60px 0" },
  column: {},
  "inner-section": {},
  block: {},

  // common blocks
  text: { text: "Edit text" },
  heading: { text: "Heading here" },
  button: { text: "Click", href: "#" },
  image: { src: "", alt: "" },
};

/**
 * -------------------------------------------------------------------
 * Deep merge utility (simple + safe)
 * -------------------------------------------------------------------
 */
function deepMerge<T extends Record<string, any>>(base: T, override: T): T {
  const out: any = { ...base };
  for (const key in override) {
    if (
      override[key] &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key])
    ) {
      out[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

/**
 * -------------------------------------------------------------------
 * RESPONSIVE MERGE
 * -------------------------------------------------------------------
 * tree.layout = {
 *   base: { ... }
 *   tablet: { ... }
 *   mobile: { ... }
 * }
 */
function getResponsiveValue(
  layout: any,
  device: "desktop" | "tablet" | "mobile"
) {
  if (!layout) return {};

  if (device === "mobile" && layout.mobile) return deepMerge(layout.base || {}, layout.mobile);
  if (device === "tablet" && layout.tablet) return deepMerge(layout.base || {}, layout.tablet);

  return layout.base || {};
}

/**
 * -------------------------------------------------------------------
 * V3 getMerged() — merges all styling layers:
 * props + style + layout + effects
 * -------------------------------------------------------------------
 */
export function getMerged(node: BuilderNode, device: "desktop" | "tablet" | "mobile") {
  const defaults = DEFAULT_PROPS[node.type] || {};
  const props = deepMerge(defaults, node.props || {});

  const style = {
    ...(node.style || {}),
    ...(node.layout ? getResponsiveValue(node.layout, device) : {}),
  };

  // Effects → opacity, filters, transitions, interactions, animations
  const effects = node.effects || {};

  return { props, style, effects };
}

/**
 * -------------------------------------------------------------------
 * mapBlueprintToRendererNode() — core transform
 * -------------------------------------------------------------------
 * Converts BuilderNode → RendererNode
 */
export function mapBlueprintToRendererNode(node: BuilderNode): RendererNode {
  const device = getDevice(); // read current responsive device from store

  const merged = getMerged(node, device);

  return {
    id: node.id,
    type: node.type,

    /* RENDER-READY MERGED OUTPUT */
    props: merged.props,
    style: merged.style,
    effects: merged.effects,

    /* Raw attributes from Blueprint */
    rawProps: node.props,
    rawStyle: node.style,
    rawLayout: node.layout,
    rawEffects: node.effects,

    children: (node.children || []).map((child) =>
      mapBlueprintToRendererNode(child)
    ),

    /* For NodeRenderer class merging */
    className: cn(
      `buildez-node buildez-${node.type}`,
      merged.style?.className || ""
    ),
  };
}
