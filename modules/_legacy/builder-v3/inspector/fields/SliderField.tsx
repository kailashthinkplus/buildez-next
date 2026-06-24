"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

export default function SliderField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const value = field.name
    .split(".")
    .reduce((a, b) => (a ? a[b] : 0), node);

  const onChange = (e) => {
    const newNode = structuredClone(node);
    setDeep(newNode, field.name, Number(e.target.value));
    update(node.id, newNode.props);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">
        {field.label}: {value}
      </label>

      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
}
