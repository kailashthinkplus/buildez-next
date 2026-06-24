"use client";

import { WidgetProps } from "../core/BaseWidget";

export default function HeadingWidget({
  node,
}: WidgetProps) {

  return (
    <h2>
      {node.props.text}
    </h2>
  );
}