"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

/* ==========================================================
   TYPES
========================================================== */

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectPropertyProps {
  node: BuilderNode;

  property: string;

  label: string;

  options: SelectOption[];

  placeholder?: string;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function SelectProperty({
  node,
  property,
  label,
  options,
  placeholder = "Select...",
}: SelectPropertyProps) {
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

      <div className="relative">

        <select
          value={value}
          onChange={(e) => update(e.target.value)}
          className="
            w-full
            h-10
            rounded-lg
            border
            border-white/10
            bg-[#111827]
            px-3
            pr-10
            text-sm
            text-white
            outline-none
            appearance-none
            focus:border-blue-500
          "
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-white/40
            pointer-events-none
          "
        />

      </div>

    </div>
  );
}