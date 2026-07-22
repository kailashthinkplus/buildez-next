"use client";

import type { BuilderNode } from "../../types/blueprint";
import RenderNode from "../../core/renderer/RenderNode";

export default function renderChildren(
  children: BuilderNode[]
) {
  if (!children.length) {
    return null;
  }

  return (
    <>
      {children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
        />
      ))}
    </>
  );
}