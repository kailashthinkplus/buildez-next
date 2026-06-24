"use client";

import React from "react";

export default function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/70">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`
          relative w-10 h-5 rounded-full transition
          ${value ? "bg-blue-500/70" : "bg-white/20"}
        `}
      >
        <div
          className={`
            absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all
            ${value ? "left-5" : "left-0.5"}
            shadow-[0_0_6px_rgba(255,255,255,0.5)]
          `}
        />
      </button>
    </div>
  );
}
