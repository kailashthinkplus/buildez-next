"use client";

import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../hooks/useNodeUpdater";
import { SliderWithInput, UnitInput } from "../tabs/InspectorControls";
import { parseUnitValue, type InspectorUnit } from "../utils/unitValue";

/* ==========================================================
   TYPES
========================================================== */

interface SliderPropertyProps {
  node: BuilderNode;

  property: string;

  label: string;

  target?: "props" | "style";

  min: number;

  max: number;

  step?: number;

  unit?: string;

  units?: readonly InspectorUnit[];
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function SliderProperty({
  node,
  property,
  label,
  target = "props",
  min,
  max,
  step = 1,
  unit = "",
  units,
}: SliderPropertyProps) {

  const { updateNode } = useNodeUpdater();

  const currentRaw =
    target === "props"
      ? node.props?.[property] ?? min
      : node.style?.[property] ?? min;

  const [value, setValue] = useState<unknown>(currentRaw);

  useEffect(() => {
    setValue(
      target === "props"
        ? node.props?.[property] ?? min
        : node.style?.[property] ?? min
    );
  }, [node.id, node.props, node.style, property, min, target]);

  function update(next: number | string) {

    setValue(next);

    if (target === "props") {
      updateNode(node.id, {
        props: {
          ...node.props,
          [property]: next,
        },
      });
      return;
    }

    updateNode(node.id, {
      style: {
        ...node.style,
        [property]: next,
      },
    });

  }

  return (

    <div className="space-y-3">

      <div className="flex items-center justify-between">

        <label className="text-xs font-medium text-white/70">
          {label}
        </label>

        <span className="text-xs text-white/50">
          {formatDisplayValue(value, unit)}
        </span>

      </div>

      {target === "style" && (unit || units) ? (
        <UnitInput
          value={value}
          onChange={update}
          min={min}
          max={max}
          step={step}
          units={units}
          fallbackUnit={(unit || "px") as InspectorUnit}
        />
      ) : (
        <SliderWithInput
          value={Number(value ?? min)}
          onChange={update}
          min={min}
          max={max}
          step={step}
          unit={unit}
        />
      )}

    </div>

  );

}

function formatDisplayValue(value: unknown, unit: string) {
  if (typeof value === "string") return value;
  if (unit) {
    const parsed = parseUnitValue(value, unit as InspectorUnit);
    return `${parsed.value}${parsed.unit}`;
  }
  return String(value ?? "");
}
