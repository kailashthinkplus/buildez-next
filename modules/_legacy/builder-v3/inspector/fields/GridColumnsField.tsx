"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

/**
 * GridColumnsField
 * Edits CSS grid template columns string:
 *
 * Example values:
 * - "1fr 1fr 1fr"
 * - "repeat(4, 1fr)"
 */
export default function GridColumnsField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const value = field.name
    .split(".")
    .reduce((a, b) => (a ? a[b] : ""), node);

  const onChange = (e) => {
    const newNode = structuredClone(node);
    setDeep(newNode, field.name, e.target.value);
    update(node.id, newNode.props);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{field.label}</label>

      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        className="border rounded px-2 py-1 text-sm"
        placeholder='e.g. "1fr 1fr 1fr" or "repeat(3, 1fr)"'
      />
    </div>
  );
}
