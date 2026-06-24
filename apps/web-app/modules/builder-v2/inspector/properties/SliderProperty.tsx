"use client";

import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

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
}: SliderPropertyProps) {

  const updateNode = useNodeUpdater();

  const [value, setValue] = useState<number>(
    Number(
      target === "props"
        ? node.props?.[property] ?? min
        : node.style?.[property] ?? min
    )
  );

  useEffect(() => {
    setValue(
      Number(
        target === "props"
          ? node.props?.[property] ?? min
          : node.style?.[property] ?? min
      )
    );
  }, [node.id, node.props, node.style, property, min, target]);

  function update(next: number) {

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
          {value}
          {unit}
        </span>

      </div>

      <Slider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => update(next)}
        className="
          relative
          flex
          items-center
          w-full
          h-5
        "
      >

        <Slider.Track
          className="
            relative
            grow
            h-1.5
            rounded-full
            bg-white/10
          "
        >

          <Slider.Range
            className="
              absolute
              h-full
              rounded-full
              bg-blue-600
            "
          />

        </Slider.Track>

        <Slider.Thumb
          className="
            block
            h-4
            w-4
            rounded-full
            border
            border-blue-500
            bg-white
            shadow-lg
            outline-none
            transition-transform
            hover:scale-110
            focus:ring-2
            focus:ring-blue-500/40
          "
        />

      </Slider.Root>

    </div>

  );

}