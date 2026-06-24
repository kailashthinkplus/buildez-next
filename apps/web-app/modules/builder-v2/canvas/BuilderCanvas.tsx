"use client";

import type {
  BuilderBlueprint,
  BuilderNode,
} from "../types/blueprint";

import NodeRenderer from "./NodeRenderer";
import SelectionOverlay from "./SelectionOverlay";
import HoverOverlay from "./HoverOverlay";

interface CanvasRootProps {
  blueprint: BuilderBlueprint;

  onCanvasClick?(): void;
}

export default function CanvasRoot({
  blueprint,
  onCanvasClick,
}: CanvasRootProps) {
  const rootNode = blueprint.nodes[blueprint.root];

  if (!rootNode) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Root node not found.
      </div>
    );
  }

  const rootNodes: BuilderNode[] = [rootNode];

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        bg-white
      "
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCanvasClick?.();
        }
      }}
    >
      <NodeRenderer nodes={rootNodes} blueprint={blueprint} />

      <SelectionOverlay />

      <HoverOverlay />
    </div>
  );
}