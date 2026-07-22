"use client";

import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../hooks/useNodeUpdater";
import { AlignmentInput } from "../tabs/InspectorControls";

interface AlignmentPropertyProps {
  node: BuilderNode;
  property: string;
  label: string;
}

export default function AlignmentProperty({
  node,
  property,
  label,
}: AlignmentPropertyProps) {
  const { updateStyle } = useNodeUpdater();
  const [value, setValue] = useState(String(node.style?.[property] ?? "left"));

  useEffect(() => {
    setValue(String(node.style?.[property] ?? "left"));
  }, [node.id, node.style, property]);

  const update = (next: string) => {
    setValue(next);
    updateStyle(node.id, property, next);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">{label}</label>
      <AlignmentInput value={value} onChange={update} kind="text" />
    </div>
  );
}
