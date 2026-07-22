"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { CSSProperties } from "react";
import type { BuilderNode } from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

export default function Image({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={String(props.src || "https://placehold.co/1200x800/e2e8f0/64748b?text=Image")}
        alt={String(props.alt || "Image")}
        style={{
          width: "100%",
          maxWidth: style.maxWidth,
          height: style.height,
          borderRadius: style.borderRadius,
          objectFit: (style.objectFit as CSSProperties["objectFit"]) || "cover",
          boxShadow: style.boxShadow,
        }}
      />
    </WidgetFrame>
  );
}
