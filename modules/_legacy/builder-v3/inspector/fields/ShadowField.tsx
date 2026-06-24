"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

/**
 * ShadowField
 *
 * Controls shadow:
 * {
 *   x: number,
 *   y: number,
 *   blur: number,
 *   spread: number,
 *   color: string
 * }
 *
 * field.name = "props.style.shadow"
 */
export default function ShadowField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const shadow = field.name
    .split(".")
    .reduce((a, b) => (a ? a[b] : {}), node) || {};

  const setVal = (prop, val) => {
    const newNode = structuredClone(node);
    setDeep(newNode, `${field.name}.${prop}`, val);
    update(node.id, newNode.props);
  };

  const numberInput = (label, prop, min, max) => (
    <div className="flex flex-col w-full">
      <label className="text-[10px] text-gray-500 uppercase">{label}</label>
      <input
        type="number"
        className="border rounded px-2 py-1 text-sm"
        value={shadow[prop] ?? 0}
        min={min}
        max={max}
        onChange={(e) => setVal(prop, Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">

      {/* Shadow offset */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1">
          Offset
        </div>
        <div className="flex gap-3">
          {numberInput("X", "x", -200, 200)}
          {numberInput("Y", "y", -200, 200)}
        </div>
      </div>

      {/* Blur + Spread */}
      <div>
        <div className="text-xs font-semibold text-gray-700 mb-1">
          Blur / Spread
        </div>
        <div className="flex gap-3">
          {numberInput("Blur", "blur", 0, 300)}
          {numberInput("Spread", "spread", -200, 200)}
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Shadow Color</label>
        <input
          type="color"
          className="h-8 w-full rounded"
          value={shadow.color || "#000000"}
          onChange={(e) => setVal("color", e.target.value)}
        />
      </div>

      {/* Reset */}
      <button
        className="px-2 py-1 text-xs bg-gray-100 border rounded w-fit"
        onClick={() => {
          const newNode = structuredClone(node);
          setDeep(newNode, field.name, {});
          update(node.id, newNode.props);
        }}
      >
        Reset Shadow
      </button>
    </div>
  );
}
