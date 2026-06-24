"use client";

import React from "react";
import { CanvasEventBridge } from "./CanvasEventBridge";
import HighlightLayer from "./wrappers/HighlightLayer";
import SelectionBox from "./wrappers/SelectionBox";
import GhostPortal from "./GhostPortal";
import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";

/**
 * CanvasProviders
 * Wraps all canvas-level systems:
 * - Event bridge (mouse, hover, selection)
 * - Ghost portal for drag previews
 * - Selection box renderer
 * - Highlight layers (hover + selected + drag)
 */
export function CanvasProviders({ children }: { children: React.ReactNode }) {
  const rectMap = useHighlightStore((s) => s.rectMap);

  return (
    <>
      {/* Event and interaction engine */}
      <CanvasEventBridge />

      {/* Actual rendered content */}
      {children}

      {/* Drag ghost mirror (currently empty placeholder) */}
      <GhostPortal>
        <></>
      </GhostPortal>

      {/* Selection rectangle */}
      <SelectionBox />

      {/* Hover + selected highlight layer */}
      <HighlightLayer rectMap={rectMap} />
    </>
  );
}

export default CanvasProviders;
