"use client";

import React from "react";

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full px-3 py-2
          rounded-lg
          bg-white/[0.07]
          border border-white/10
          text-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          transition
        "
      />
    </div>
  );
}
