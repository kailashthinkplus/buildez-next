"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import renderChildren from "../sdk/renderChildren";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Container({
  node,
}: Props) {

  const {

    props,

    style,

    children,

  } = useWidget(node);

  return (

    <WidgetFrame

      nodeId={node.id}

      style={{
  display: "flex",
  flexDirection: "row",
  gap: 24,
  border: "3px solid red",
}}

    >

      {renderChildren(children)}

    </WidgetFrame>

  );

}