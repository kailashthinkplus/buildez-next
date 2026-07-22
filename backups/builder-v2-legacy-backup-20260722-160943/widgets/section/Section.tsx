"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import renderChildren from "../sdk/renderChildren";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Section({
  node,
}: Props) {

  const {

    style,

    children,

  } = useWidget(node);

  return (

    <WidgetFrame

      nodeId={node.id}

      className="relative w-full"

      style={{
        background: style.backgroundColor,
      }}

    >

      {renderChildren(children)}

    </WidgetFrame>

  );

}