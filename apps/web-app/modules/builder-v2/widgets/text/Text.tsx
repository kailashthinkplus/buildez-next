"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

export default function Text({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <p
        style={{
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          textAlign: style.textAlign,
          maxWidth: style.maxWidth,
          marginBottom: style.marginBottom,
          textTransform: style.textTransform,
          letterSpacing: style.letterSpacing,
        }}
      >
        {String(props.text ?? "")}
      </p>
    </WidgetFrame>
  );
}
