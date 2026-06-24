import React from "react";
import { RendererProps } from "../rendererTypes";
import { renderNode } from "../rendererEngine";
import { useLayoutStore } from "../../layout/useLayoutStore";

export function FlexLayout({ node }: RendererProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: node.style?.direction ?? "column",
        gap: node.style?.gap ?? 0,
      }}
    >
      {node.children?.map((child) => renderNode(child))}
    </div>
  );
}
