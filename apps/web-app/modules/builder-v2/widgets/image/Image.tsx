"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Image({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <img
        src={String(props.src || "https://placehold.co/1200x800/e2e8f0/64748b?text=Image")}
        alt={String(props.alt || "Image")}
        style={{
          width: "100%",
          maxWidth: style.maxWidth,
          borderRadius: style.borderRadius,
          objectFit: (style.objectFit as any) || "cover",
        }}
      />
    </WidgetFrame>
  );
}
