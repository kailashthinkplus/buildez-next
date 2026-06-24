"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

/**
 * ImageField
 * Supports:
 *  - URL input
 *  - Image preview
 *  - Clear button
 *
 * field.name: e.g. "props.content.src"
 */
export default function ImageField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const value =
    field.name.split(".").reduce((acc, k) => (acc ? acc[k] : ""), node) || "";

  const setVal = (v: string) => {
    const newNode = structuredClone(node);
    setDeep(newNode, field.name, v);
    update(node.id, newNode.props);
  };

  return (
    <div className="flex flex-col gap-2">

      <label className="text-xs text-gray-500">{field.label}</label>

      {/* URL input */}
      <input
        type="text"
        value={value}
        placeholder="Image URL"
        onChange={(e) => setVal(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />

      {/* Preview */}
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt=""
            className="w-full h-auto rounded border"
          />

          <button
            onClick={() => setVal("")}
            className="absolute top-1 right-1 px-2 py-0.5 bg-white border rounded text-xs"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-gray-400">
          No image selected
        </div>
      )}
    </div>
  );
}
