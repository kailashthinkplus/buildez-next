"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Text({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <p
        style={{
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          textAlign: style.textAlign,
          marginBottom: style.marginBottom,
        }}
      >
        {String(props.text ?? "")}
      </p>
    </WidgetFrame>
  );
}
