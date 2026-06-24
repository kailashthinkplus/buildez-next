"use client";

import { useState, useEffect } from "react";

import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

interface TextPropertyProps {
  node: BuilderNode;
  property: string;
  label: string;
  placeholder?: string;
}

export default function TextProperty({
  node,
  property,
  label,
  placeholder,
}: TextPropertyProps) {
  const updateNode = useNodeUpdater();

  const target =
  property === "text" ||
  property === "url" ||
  property === "alt" ||
  property === "title"
    ? "props"
    : "style";

const [value, setValue] = useState(
  String(
    target === "props"
      ? node.props?.[property] ?? ""
      : node.style?.[property] ?? ""
  )
);

  useEffect(() => {
  setValue(
    String(
      target === "props"
        ? node.props?.[property] ?? ""
        : node.style?.[property] ?? ""
    )
  );
}, [
  node.id,
  node.props,
  node.style,
  property,
  target,
]);

  function update(next: string) {
  setValue(next);

  const target =
    property === "text" ||
    property === "url" ||
    property === "alt" ||
    property === "title"
      ? "props"
      : "style";

  updateNode(
    node.id,
    target === "props"
      ? {
          props: {
            ...node.props,
            [property]: next,
          },
        }
      : {
          style: {
            ...node.style,
            [property]: next,
          },
        }
  );
}

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => update(e.target.value)}
        className="
          w-full
          h-10
          rounded-lg
          border
          border-white/10
          bg-[#111827]
          px-3
          text-sm
          text-white
          outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}