"use client";

import * as Switch from "@radix-ui/react-switch";
import { useEffect, useState } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

/* ==========================================================
   TYPES
========================================================== */

interface SwitchPropertyProps {
  node: BuilderNode;

  property: string;

  label: string;

  description?: string;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function SwitchProperty({
  node,
  property,
  label,
  description,
}: SwitchPropertyProps) {
  const updateNode = useNodeUpdater();

  const [checked, setChecked] = useState(
    Boolean(node.props?.[property])
  );

  useEffect(() => {
    setChecked(Boolean(node.props?.[property]));
  }, [node.id, node.props, property]);

  function update(next: boolean) {
    setChecked(next);

    updateNode(node.id, {
      props: {
        ...node.props,
        [property]: next,
      },
    });
  }

  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-3
      "
    >
      <div className="flex-1">

        <div className="text-sm font-medium text-white">
          {label}
        </div>

        {description && (
          <div className="mt-1 text-xs text-white/50">
            {description}
          </div>
        )}

      </div>

      <Switch.Root
        checked={checked}
        onCheckedChange={update}
        className="
          relative
          h-6
          w-11
          rounded-full
          transition-colors
          data-[state=checked]:bg-blue-600
          data-[state=unchecked]:bg-white/15
        "
      >
        <Switch.Thumb
          className="
            block
            h-5
            w-5
            rounded-full
            bg-white
            shadow-lg
            transition-transform
            translate-x-0.5
            data-[state=checked]:translate-x-5
          "
        />
      </Switch.Root>

    </div>
  );
}