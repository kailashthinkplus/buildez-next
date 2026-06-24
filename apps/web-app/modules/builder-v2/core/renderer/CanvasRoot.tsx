"use client";

import { BuilderNode } from "../../types/blueprint";
import NodeRenderer from "./NodeRenderer";
import SelectionOverlay from "./SelectionOverlay";
import HoverOverlay from "./HoverOverlay";

interface Props {
  nodes: BuilderNode[];
}

export default function CanvasRoot({
  nodes,
}: Props) {
  return (
    <div
      className="
      relative
      w-full
      min-h-screen
      bg-white
      overflow-auto
      "
    >
      <NodeRenderer nodes={nodes} />

      <SelectionOverlay />

      <HoverOverlay />
    </div>
  );
}