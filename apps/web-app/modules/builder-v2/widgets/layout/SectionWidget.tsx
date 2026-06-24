"use client";

import { WidgetProps } from "../core/BaseWidget";
import NodeRenderer from "../../renderer/NodeRenderer";

export default function SectionWidget({
  node,
}: WidgetProps) {

  return (
    <section>

      {node.children.map((child) => (
        <NodeRenderer
          key={child.id}
          node={child}
        />
      ))}

    </section>
  );
}