"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";

interface Props {
  node: any;
}

export default function Video({ node }: Props) {
  const { props, style } = useWidget(node);

  return (
    <WidgetFrame nodeId={node.id}>
      <video
        controls
        poster={String(props.poster || "")}
        style={{
          width: "100%",
          borderRadius: style.borderRadius,
          background: "#000",
        }}
      >
        <source src={String(props.src || "")} type={String(props.mimeType || "video/mp4")} />
      </video>
    </WidgetFrame>
  );
}
