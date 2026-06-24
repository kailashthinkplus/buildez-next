"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

export default function ColorField({ node, field }) {
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
        type="color"
        value={value || "#000000"}
        onChange={onChange}
        className="h-8 w-full rounded cursor-pointer"
      />
    </div>
  );
}
