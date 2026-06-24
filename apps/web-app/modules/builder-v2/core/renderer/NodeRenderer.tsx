"use client";

import type { BuilderNode } from "../../types/blueprint";
import RenderNode from "./RenderNode";

interface NodeRendererProps {
  nodes: BuilderNode[];
}

export default function NodeRenderer({
  nodes,
}: NodeRendererProps) {
  if (!nodes.length) {
    return null;
  }

  return (
    <>
      {nodes.map((node) => (
        <RenderNode
          key={node.id}
          node={node}
        />
      ))}
    </>
  );
}