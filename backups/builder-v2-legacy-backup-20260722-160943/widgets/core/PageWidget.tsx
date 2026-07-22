"use client";

import { WidgetProps } from "./BaseWidget";
import NodeRenderer from "../../renderer/NodeRenderer";

export default function PageWidget({
  node,
}: WidgetProps) {

  return (
    <div className="min-h-screen">

      {node.children.map((child) => (
        <NodeRenderer
          key={child.id}
          node={child}
        />
      ))}

    </div>
  );
}