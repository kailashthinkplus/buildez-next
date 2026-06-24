"use client";

import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

/* ==========================================================
   TYPES
========================================================== */

interface ColorPropertyProps {
  node: BuilderNode;

  property: string;

  label: string;

  placeholder?: string;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function ColorProperty({
  node,
  property,
  label,
  placeholder = "#000000",
}: ColorPropertyProps) {

  const { updateStyle } = useNodeUpdater();

  const [value, setValue] = useState(
    String(node.style?.[property] ?? "")
  );

  useEffect(() => {
    setValue(
      String(node.style?.[property] ?? "")
    );
  }, [node.id, node.style, property]);

  function update(next: string) {

    setValue(next);

    updateStyle(
      node.id,
      property,
      next
    );

  }

  return (

    <div className="space-y-2">

      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* Color Preview */}

        <div
          className="
            h-10
            w-10
            rounded-lg
            border
            border-white/10
            shrink-0
          "
          style={{
            background: value || "#ffffff",
          }}
        />

        {/* Hex Input */}

        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            update(e.target.value)
          }
          className="
            flex-1
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

    </div>

  );

}