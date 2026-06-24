"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

export default function SwitchField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const value = field.name
    .split(".")
    .reduce((a, b) => (a ? a[b] : false), node);

  const onChange = () => {
    const newNode = structuredClone(node);
    setDeep(newNode, field.name, !value);
    update(node.id, newNode.props);
  };

  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-xs text-gray-500">{field.label}</label>

      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition
          ${value ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <div
          className={`h-4 w-4 bg-white rounded-full transform transition
            ${value ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
