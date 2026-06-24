"use client";

import React, { useState } from "react";
import { Link2, Link2Off } from "lucide-react";

type SpacingValue = {
  t: number;
  r: number;
  b: number;
  l: number;
};

export default function SpacingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SpacingValue;
  onChange: (v: SpacingValue) => void;
}) {
  const [linked, setLinked] = useState(true);

  const updateSide = (side: keyof SpacingValue, v: number) => {
    if (linked) {
      onChange({ t: v, r: v, b: v, l: v });
    } else {
      onChange({ ...value, [side]: v });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs text-white/60">{label}</label>

        <button
          onClick={() => setLinked(!linked)}
          className="
            p-1 rounded-md transition
            bg-white/10 border border-white/10
            hover:bg-white/20
          "
        >
          {linked ? (
            <Link2 size={14} className="text-blue-400" />
          ) : (
            <Link2Off size={14} className="text-white/50" />
          )}
        </button>
      </div>

      {/* TRBL Grid */}
      <div
        className="
          grid grid-cols-3 gap-2 p-3
          bg-white/[0.04] rounded-xl border border-white/10
          shadow-inner
        "
      >
        {/* Top */}
        <div className="col-span-3 flex justify-center">
          <SpacingInput
            value={value.t}
            onChange={(v) => updateSide("t", v)}
            label="T"
          />
        </div>

        {/* Left */}
        <div className="flex justify-end">
          <SpacingInput
            value={value.l}
            onChange={(v) => updateSide("l", v)}
            label="L"
          />
        </div>

        {/* Center placeholder */}
        <div className="flex items-center justify-center text-[10px] text-white/30">
          {linked ? "Linked" : ""}
        </div>

        {/* Right */}
        <div className="flex justify-start">
          <SpacingInput
            value={value.r}
            onChange={(v) => updateSide("r", v)}
            label="R"
          />
        </div>

        {/* Bottom */}
        <div className="col-span-3 flex justify-center">
          <SpacingInput
            value={value.b}
            onChange={(v) => updateSide("b", v)}
            label="B"
          />
        </div>
      </div>
    </div>
  );
}

function SpacingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-white/50 mb-1">{label}</span>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-12 px-2 py-1
          text-sm text-white text-center
          bg-white/[0.07]
          border border-white/10 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
        "
      />
    </div>
  );
}
