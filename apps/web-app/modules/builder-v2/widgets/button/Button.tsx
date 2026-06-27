"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

export default function Button({ node }: Props) {

  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>

      <button
        style={{
          background: style.backgroundColor,
          color: style.color,
          borderRadius: style.borderRadius,
          padding: `${style.paddingY}px ${style.paddingX}px`,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          width: props.fullWidth ? "100%" : "auto",
          marginTop: style.marginTop,
          cursor: "pointer",
          border: style.border ?? "none",
        }}
      >
        {String(props.text ?? "Button")}
      </button>

    </WidgetFrame>
  );
}
