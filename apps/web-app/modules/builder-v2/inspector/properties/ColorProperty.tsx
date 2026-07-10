"use client";

import { useEffect, useState } from "react";

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

  const { updateStyle } = useNodeUpdater();

  const [value, setValue] = useState(
    String(node.style?.[property] ?? "")
  );

  useEffect(() => {
    setValue(
      String(node.style?.[property] ?? "")
    );
  }, [node.id, node.style, property]);

  function update(next: string | undefined) {

    setValue(next ?? "");

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

      <ColorPicker
        value={value || placeholder}
        onChange={update}
        onClear={() => update(undefined)}
        themeTokenReady
      />

    </div>

  );

}
