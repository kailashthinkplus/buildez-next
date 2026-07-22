"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Spacer({ node }: Props) {
  const { style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <div
        style={{
          width: "100%",
          height: style.height || 24,
          minHeight: style.height || 24,
        }}
      />
    </WidgetFrame>
  );
}
