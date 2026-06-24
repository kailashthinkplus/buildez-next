"use client";

import React, { useRef, useEffect } from "react";
import { setDeep } from "./utils/setDeep";
import { useBlueprintStore } from "../../state/useBlueprintStore";

/**
 * RichTextField
 * - Multi-line text editor
 * - Auto-resizes height
 * - Uses instant update
 */
export default function RichTextField({ node, field }) {
  const update = useBlueprintStore((s) => s.updateNodeProps);

  const value =
    field.name.split(".").reduce((acc, k) => (acc ? acc[k] : ""), node) || "";

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const onChange = (e) => {
    const newVal = e.target.value;
    const newNode = structuredClone(node);
    setDeep(newNode, field.name, newVal);
    update(node.id, newNode.props);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{field.label}</label>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        className="
          border rounded px-2 py-1 text-sm resize-none w-full
          leading-5
        "
        placeholder="Enter text..."
      />
    </div>
  );
}
