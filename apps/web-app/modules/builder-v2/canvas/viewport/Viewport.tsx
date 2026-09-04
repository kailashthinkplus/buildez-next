"use client";

import { ReactNode } from "react";
import { useViewportStore } from "../store/useViewportStore";

interface Props {
  children: ReactNode;
}

export default function Viewport({
  children,
}: Props) {

  const scale = useViewportStore((state) => state.scale);

  return (
    <div
      className="origin-top transition-transform duration-150"
      style={{
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
