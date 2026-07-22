"use client";

import type { BuilderNode } from "../../types/blueprint";

import { WidgetRegistry } from "../registry/WidgetRegistry";
import { useSelectionStore } from "../../store/useSelectionStore";

interface RenderNodeProps {
  node: BuilderNode;
}

export default function RenderNode({
  node,
}: RenderNodeProps) {
  const widget = WidgetRegistry.get(node.type);

  const {
    hoveredNodeId,
    select,
    hover,
  } = useSelectionStore();

  const Widget = widget.render;

  return (
    <div
      data-node-id={node.id}
      className="relative"
      onClick={(e) => {
        e.stopPropagation();
        select(node.id);
      }}
      onMouseEnter={() => hover(node.id)}
      onMouseLeave={() => hover(undefined)}
    >
      <Widget node={node} />

      {hoveredNodeId === node.id && (
        <div className="pointer-events-none absolute inset-0 rounded border border-blue-400/60" />
      )}
    </div>
  );
}
