"use client";

import { WidgetProps } from "../core/BaseWidget";
import NodeRenderer from "../../renderer/NodeRenderer";

export default function ContainerWidget({
  node,
}: WidgetProps) {

  return (
    <div>

      {node.children.map((child) => (
        <NodeRenderer
          key={child.id}
          node={child}
        />
      ))}

    </div>
  );
}