"use client";

import { ReactNode } from "react";
import { useCanvasStore } from "../store/useViewportStore";

interface Props {
  children: ReactNode;
}

export default function Viewport({
  children,
}: Props) {

  const zoom = useCanvasStore((s) => s.zoom);

  return (
    <div
      className="origin-top transition-transform duration-150"
      style={{
        transform: `scale(${zoom / 100})`,
      }}
    >
      {children}
    </div>
  );
}