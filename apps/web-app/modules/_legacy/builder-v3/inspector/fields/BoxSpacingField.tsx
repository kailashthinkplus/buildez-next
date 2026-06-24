"use client";

import React from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

/**
 * BoxSpacingField
 * Webflow-style 4-way spacing control:
 * - padding (top/right/bottom/left)
 * - margin  (top/right/bottom/left)
 *
 * field.name → "props.spacing"
 */
export default function BoxSpacingField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const spacing = field.name
    .split(".")
    .reduce((a, b) => (a ? a[b] : {}), node) || {};

  const padding = spacing.padding ?? {};
  const margin = spacing.margin ?? {};

  const setVal = (path, val) => {
    const newNode = structuredClone(node);
    setDeep(newNode, `${field.name}.${path}`, val);
    update(node.id, newNode.props);
  };

  const renderInput = (label, value, onChange) => (
    <div className="flex flex-col items-center w-16">
      <span className="text-[10px] text-gray-500 uppercase">{label}</span>
      <input
        type="number"
        className="w-full border rounded px-1 py-0.5 text-xs text-center"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">

      {/* PADDING */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Padding</div>
        <div className="flex justify-between">
          {renderInput("Top", padding.top, (v) => setVal("padding.top", v))}
          {renderInput("Right", padding.right, (v) => setVal("padding.right", v))}
          {renderInput("Bottom", padding.bottom, (v) => setVal("padding.bottom", v))}
          {renderInput("Left", padding.left, (v) => setVal("padding.left", v))}
        </div>
      </div>

      {/* MARGIN */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Margin</div>
        <div className="flex justify-between">
          {renderInput("Top", margin.top, (v) => setVal("margin.top", v))}
          {renderInput("Right", margin.right, (v) => setVal("margin.right", v))}
          {renderInput("Bottom", margin.bottom, (v) => setVal("margin.bottom", v))}
          {renderInput("Left", margin.left, (v) => setVal("margin.left", v))}
        </div>
      </div>

      {/* Reset buttons */}
      <div className="flex gap-2">
        <button
          className="px-2 py-1 text-xs bg-gray-100 border rounded"
          onClick={() => {
            const newNode = structuredClone(node);
            setDeep(newNode, `${field.name}.padding`, {});
            update(node.id, newNode.props);
          }}
        >
          Reset Padding
        </button>

        <button
          className="px-2 py-1 text-xs bg-gray-100 border rounded"
          onClick={() => {
            const newNode = structuredClone(node);
            setDeep(newNode, `${field.name}.margin`, {});
            update(node.id, newNode.props);
          }}
        >
          Reset Margin
        </button>
      </div>
    </div>
  );
}
