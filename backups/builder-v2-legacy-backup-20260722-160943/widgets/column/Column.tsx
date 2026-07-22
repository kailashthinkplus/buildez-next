"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import renderChildren from "../sdk/renderChildren";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Column({ node }: Props) {
  const {
  props,
  style,
  children,
} = useWidget(node);

  return (
    <WidgetFrame
      nodeId={node.id}
      style={{
  flex: style.flex ?? 1,
  minWidth: style.minWidth ?? 0,
  minHeight: style.minHeight || 80,
  padding: style.padding || 8,
  display: "flex",
  flexDirection:
    props.layout === "horizontal"
      ? "row"
      : "column",
  gap: style.gap || 12,
}}
    >
      {renderChildren(children)}
    </WidgetFrame>
  );
}
