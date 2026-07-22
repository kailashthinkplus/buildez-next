"use client";

import { Play } from "lucide-react";
import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

export default function Video({ node }: Props) {
  const { props, style } = useWidget(node);
  const src = String(props.src || "");

  if (!src) {
    return (
      <WidgetFrame nodeId={node.id}>
        <div
          className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-950 text-white"
          style={{
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Play className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">Video block</div>
              <div className="mt-1 text-xs text-white/55">
                Add a video URL or upload media
              </div>
            </div>
          </div>
        </div>
      </WidgetFrame>
    );
  }

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
        <source src={src} type={String(props.mimeType || "video/mp4")} />
      </video>
    </WidgetFrame>
  );
}
