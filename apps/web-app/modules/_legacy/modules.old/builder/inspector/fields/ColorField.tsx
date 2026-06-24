"use client";

import React from "react";

export default function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>

      <div className="flex items-center gap-3">
        {/* Color circle preview */}
        <div
          className="
            w-6 h-6 rounded-full border border-white/20
            shadow-[0_0_6px_rgba(255,255,255,0.2)]
          "
          style={{ backgroundColor: value || "#ffffff" }}
        />

        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-10 h-10 p-1 rounded-lg cursor-pointer
            bg-white/10 border border-white/10
            [&::-webkit-color-swatch]:rounded-md
            [&::-webkit-color-swatch-wrapper]:p-0
          "
        />

        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="
            flex-1 px-3 py-2 rounded-lg
            bg-white/[0.07]
            border border-white/10
            text-white text-xs
            focus:outline-none focus:ring-2 focus:ring-blue-500/40
            transition
          "
        />
      </div>
    </div>
  );
}
