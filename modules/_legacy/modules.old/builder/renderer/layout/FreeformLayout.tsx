import React from "react";
import { RendererProps } from "../rendererTypes";
import { renderNode } from "../rendererEngine";

export function FreeformLayout({ node }: RendererProps) {
  return (
    <div className="relative w-full h-full">
      {node.children?.map((child) => (
        <div
          key={child.id}
          style={{
            position: "absolute",
            left: child.style?.x ?? 0,
            top: child.style?.y ?? 0,
          }}
        >
          {renderNode(child)}
        </div>
      ))}
    </div>
  );
}
