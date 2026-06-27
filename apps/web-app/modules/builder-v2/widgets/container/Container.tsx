"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import renderChildren from "../sdk/renderChildren";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

type ContainerProps = {
  layout?: "flex" | "grid";
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  justify?: React.CSSProperties["justifyContent"];
  align?: React.CSSProperties["alignItems"];
  wrap?: boolean;
};

export default function Container({
  node,
}: Props) {

  const {

    props,

    style,

    children,

  } = useWidget<ContainerProps>(node);

  return (

    <WidgetFrame

      nodeId={node.id}

      style={{
        display: props.layout === "grid" ? "grid" : "flex",
        flexDirection: props.direction ?? "row",
        justifyContent: props.justify ?? "flex-start",
        alignItems: props.align ?? "stretch",
        flexWrap: props.wrap ? "wrap" : "nowrap",
        flex: style.flex,
        width: style.width ?? "100%",
        minWidth: style.minWidth,
        minHeight: style.minHeight,
        maxWidth: style.maxWidth,
        gap: style.gap ?? 24,
        padding: style.padding ?? 0,
        margin: style.margin ?? 0,
        marginTop: style.marginTop,
        borderRadius: style.borderRadius ?? 0,
        border: style.border,
        boxShadow: style.boxShadow,
        background: style.backgroundColor ?? "transparent",
        gridTemplateColumns: style.gridTemplateColumns,
        textAlign: style.textAlign,
      }}

    >

      {renderChildren(children)}

    </WidgetFrame>

  );

}
