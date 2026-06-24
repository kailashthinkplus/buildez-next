"use client";

import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

interface NumberPropertyProps {
  node: BuilderNode;

  property: string;

  label: string;

  min?: number;

  max?: number;

  step?: number;

  placeholder?: string;
}

export default function NumberProperty({
  node,
  property,
  label,
  min,
  max,
  step = 1,
  placeholder,
}: NumberPropertyProps) {
  const updateNode = useNodeUpdater();

  const [value, setValue] = useState<string>(
    node.props?.[property]?.toString() ?? ""
  );

  useEffect(() => {
    setValue(node.props?.[property]?.toString() ?? "");
  }, [node.id, node.props, property]);

  function update(next: string) {
    setValue(next);

    if (next === "") {
      updateNode(node.id, {
        props: {
          ...node.props,
          [property]: undefined,
        },
      });

      return;
    }

    const numeric = Number(next);

    if (Number.isNaN(numeric)) return;

    updateNode(node.id, {
      props: {
        ...node.props,
        [property]: numeric,
      },
    });
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <input
        type="number"
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(e) => update(e.target.value)}
        className="
          w-full
          h-10
          rounded-lg
          border
          border-white/10
          bg-[#111827]
          px-3
          text-sm
          text-white
          outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}