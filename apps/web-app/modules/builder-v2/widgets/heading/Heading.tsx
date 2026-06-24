"use client";

import type {
  BuilderNode,
  HeadingProps,
} from "../../types/blueprint";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface HeadingNode extends BuilderNode {
  type: "heading";
  props: HeadingProps;
}

interface Props {
  node: HeadingNode;
}

export default function Heading({
  node,
}: Props) {

  const {
    props,
    style,
  } = useWidget(node);

  const Tag =
    (props.level ?? "h2") as keyof JSX.IntrinsicElements;

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