"use client";
import { useEffect } from "react";
import NodeRenderer from "../../../../../modules/builder-v2/canvas/NodeRenderer";
import { useCanvasStore, type Device } from "../../../../../modules/builder-v2/store/useCanvasStore";
import type { BuilderBlueprint } from "../../../../../modules/builder-v2/types/blueprint";

export function CanvasForensicClient({ blueprint, device }: { blueprint: BuilderBlueprint; device: Device }) {
  const setDevice = useCanvasStore((state) => state.setDevice);
  useEffect(() => setDevice(device), [device, setDevice]);
  return <main data-forensic-renderer="canvas"><NodeRenderer nodes={[blueprint.nodes[blueprint.root]]} blueprint={blueprint} /></main>;
}
