"use client";

import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

interface TextareaPropertyProps {
  node: BuilderNode;
  property: string;
  label: string;
  placeholder?: string;
  rows?: number;
}

export default function TextareaProperty({
  node,
  property,
  label,
  placeholder,
  rows = 4,
}: TextareaPropertyProps) {
  const updateNode = useNodeUpdater();

  const [value, setValue] = useState(
    String(node.props?.[property] ?? "")
  );

  useEffect(() => {
    setValue(String(node.props?.[property] ?? ""));
  }, [node.id, node.props, property]);

  function update(next: string) {
    setValue(next);

    updateNode(node.id, {
      props: {
        ...node.props,
        [property]: next,
      },
    });
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => update(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-white/10
          bg-[#111827]
          p-3
          text-sm
          text-white
          resize-none
          outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}