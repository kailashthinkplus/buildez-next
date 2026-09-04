import type { DesignGraphNode, ResidualEffect } from "../design-graph/schema";

export type ClassifiedCss = Readonly<{ native: readonly string[]; residual: readonly ResidualEffect[] }>;

export function classifyNodeDesign(node: DesignGraphNode): ClassifiedCss {
  return Object.freeze({
    native: Object.freeze([...Object.keys(node.layout), ...Object.keys(node.style)]),
    residual: Object.freeze([...node.effects]),
  });
}
