"use client";

import { ReactNode } from "react";

interface Props {
  nodeId: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function WidgetFrame({
  nodeId,
  children,
  className,
  style,
}: Props) {
  return (
    <div
      data-builder-node="true"
      data-node-id={nodeId}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}