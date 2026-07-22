"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Divider({ node }: Props) {
  const { style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <hr
        style={{
          border: "none",
          borderTop: `${style.height || 1}px solid ${String(style.color || "#cbd5e1")}`,
          width: "100%",
          margin: 0,
        }}
      />
    </WidgetFrame>
  );
}
