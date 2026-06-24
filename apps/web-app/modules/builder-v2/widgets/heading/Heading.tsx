"use client";

import type { BuilderNode, HeadingProps } from "../../types/blueprint";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: BuilderNode;
}

export default function Heading({
  node,
}: Props) {

  const {
    props,
    style,
  } = useWidget<HeadingProps>(node);

  const Tag = (props.level ?? "h2") as React.ElementType;

  return (
    <WidgetFrame nodeId={node.id}>
      <Tag
        style={{
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          textAlign: style.textAlign,
          marginBottom: style.marginBottom,
        }}
      >
        {props.text}
      </Tag>
    </WidgetFrame>
  );
}
