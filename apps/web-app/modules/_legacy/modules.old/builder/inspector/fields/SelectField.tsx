"use client";

import React from "react";

export default function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number | undefined;
  options: Array<{ label: string; value: string | number }>;
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3 py-2
          rounded-lg
          bg-white/[0.07]
          border border-white/10
          text-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          transition
        "
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#0f121a] text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
