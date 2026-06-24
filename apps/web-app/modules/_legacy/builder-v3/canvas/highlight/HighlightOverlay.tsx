"use client";

import React, { useEffect, useRef } from "react";
import { useHighlightStore } from "@/modules/builder/state/useHighlightStore";
import { getHighlightClass } from "./getHighlightClass";

export default function HighlightOverlay({ nodeId }: { nodeId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rects = useHighlightStore((s) => s.rects);

  const rect = rects[nodeId];
  const cls = getHighlightClass(nodeId);

  useEffect(() => {
    if (!ref.current || !rect) return;

    ref.current.style.top = rect.top + "px";
    ref.current.style.left = rect.left + "px";
    ref.current.style.width = rect.width + "px";
    ref.current.style.height = rect.height + "px";
  }, [rect]);

  if (!rect) return null;

  return (
    <div ref={ref} className={`bz-highlight-overlay ${cls}`} />
  );
}
