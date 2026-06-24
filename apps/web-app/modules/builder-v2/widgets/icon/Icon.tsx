"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Icon({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          width: style.width || 32,
          height: style.height || 32,
          borderRadius: style.borderRadius || 8,
          alignItems: "center",
          justifyContent: "center",
          background: (style.backgroundColor as any) || "#e2e8f0",
          color: (style.color as any) || "#0f172a",
          fontSize: style.fontSize || 16,
          fontWeight: style.fontWeight || 700,
        }}
      >
        {String(props.glyph || "*")}
      </span>
    </WidgetFrame>
  );
}
