"use client";

import React from "react";

export default function SliderField({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
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
      <label className="block text-xs text-white/60 mb-1">
        {label}: <span className="text-white">{value}</span>
      </label>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full
          accent-blue-500
          cursor-pointer
        "
      />

      {/* Progress Bar */}
      <div className="mt-2 h-1.5 w-full bg-white/10 rounded">
        <div
          className="h-full bg-blue-500 rounded"
          style={{
            width: `${((value - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
