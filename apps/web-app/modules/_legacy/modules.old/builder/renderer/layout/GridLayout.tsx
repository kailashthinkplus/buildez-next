import React from "react";
import { RendererProps } from "../rendererTypes";
import { renderNode } from "../rendererEngine";

export function GridLayout({ node }: RendererProps) {
  const cols = node.style?.cols ?? 2;
  const gap = node.style?.gap ?? 16;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {node.children?.map((child) => renderNode(child))}
    </div>
  );
}
