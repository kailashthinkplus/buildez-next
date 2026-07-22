"use client";

import type { BuilderNode } from "../../types/blueprint";
import ColorPicker from "../components/ColorPicker";
import { useNodeUpdater } from "../hooks/useNodeUpdater";

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

  const { updateStyle, removeStyle } = useNodeUpdater();

  const value = String(node.style?.[property] ?? "");

  function update(next: string) {
    updateStyle(node.id, property, next);
  }

  function clear() {
    removeStyle(node.id, property);
  }

  return (

    <div className="space-y-2">

      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <ColorPicker
        value={value || placeholder}
        onChange={update}
        onClear={clear}
        themeTokenReady
      />

    </div>

  );

}
