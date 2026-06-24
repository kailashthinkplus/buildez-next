"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import renderChildren from "../sdk/renderChildren";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Page({ node }: Props) {

  const {

    children,

  } = useWidget(node);

  return (

    <WidgetFrame

      nodeId={node.id}

      className="min-h-screen bg-white dark:bg-slate-950"

    >

      {renderChildren(children)}

    </WidgetFrame>

  );

}